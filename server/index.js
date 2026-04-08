import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { createSession, deleteSession, getSessionFromRequest, hashPassword, verifyPassword } from './auth.js';
import { getPool, initializeDatabase } from './db.js';
import {
  allowedCategories,
  ngoStatusOptions,
  requestStatusOptions,
  validateDonationPayload,
  validateLoginPayload,
  validateNgoRegistrationPayload,
  validateRequestPayload,
  validateStatusUpdate,
} from './validation.js';
import { sendDonationConfirmation } from './email.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@hopehands.org').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const logStartup = (message, extra) => {
  const prefix = '[startup][api]';

  if (extra !== undefined) {
    console.log(prefix, message, extra);
    return;
  }

  console.log(prefix, message);
};

app.use(cors());
app.use(express.json());

function parseQuantity(value) {
  const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

  if (!match) {
    return { numericValue: null, unit: null };
  }

  return {
    numericValue: Number(match[1]),
    unit: match[2]?.trim() || 'units',
  };
}

function normalizeQuantityUnit(unit, itemName = '') {
  const combined = `${unit || ''} ${itemName || ''}`.toLowerCase();
  const tokens = combined.match(/[a-z]+/g) || [];

  const aliases = new Map([
    ['kg', 'kg'],
    ['kgs', 'kg'],
    ['kilogram', 'kg'],
    ['kilograms', 'kg'],
    ['g', 'g'],
    ['gm', 'g'],
    ['gms', 'g'],
    ['gram', 'g'],
    ['grams', 'g'],
    ['l', 'l'],
    ['ltr', 'l'],
    ['ltrs', 'l'],
    ['liter', 'l'],
    ['liters', 'l'],
    ['litre', 'l'],
    ['litres', 'l'],
    ['ml', 'ml'],
    ['piece', 'pieces'],
    ['pieces', 'pieces'],
    ['pc', 'pieces'],
    ['pcs', 'pieces'],
    ['unit', 'units'],
    ['units', 'units'],
    ['book', 'books'],
    ['books', 'books'],
    ['kit', 'kits'],
    ['kits', 'kits'],
    ['blanket', 'blankets'],
    ['blankets', 'blankets'],
    ['cloth', 'clothes'],
    ['clothes', 'clothes'],
  ]);

  for (const token of tokens) {
    if (aliases.has(token)) {
      return aliases.get(token);
    }
  }

  return tokens[0] || 'units';
}

function formatQuantity(value, unit) {
  if (value === null || value === undefined) {
    return 'Not available';
  }

  const normalizedValue = Number(value);
  const printableValue = Number.isInteger(normalizedValue) ? normalizedValue.toString() : normalizedValue.toFixed(2);
  return `${printableValue} ${unit || 'units'}`.trim();
}

function mapRequestRow(row) {
  const neededQuantityValue = row.needed_quantity_value === null ? null : Number(row.needed_quantity_value);
  const receivedQuantityValue = row.received_quantity_value === null ? 0 : Number(row.received_quantity_value);
  const remainingQuantityValue = neededQuantityValue === null ? null : Math.max(neededQuantityValue - receivedQuantityValue, 0);

  return {
    id: row.id,
    requestUuid: row.request_uuid,
    ngoId: row.ngo_id,
    ngoName: row.ngo_name,
    ngoLocation: row.ngo_location,
    ngoMapLink: row.ngo_map_link,
    itemName: row.item_name,
    category: row.category,
    quantity: row.quantity,
    quantityUnit: row.quantity_unit,
    neededQuantityValue,
    neededQuantityDisplay: formatQuantity(neededQuantityValue, row.quantity_unit),
    receivedQuantityValue,
    receivedQuantityDisplay: formatQuantity(receivedQuantityValue, row.quantity_unit),
    remainingQuantityValue,
    remainingQuantityDisplay: remainingQuantityValue === null ? row.quantity : formatQuantity(remainingQuantityValue, row.quantity_unit),
    description: row.description,
    image: row.image_url,
    contact: row.contact_email,
    urgent: Boolean(row.urgent),
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapNgoRow(row) {
  return {
    id: row.id,
    ngoUuid: row.ngo_uuid,
    ngoName: row.ngo_name,
    email: row.email,
    ngoLocation: row.ngo_location,
    ngoMapLink: row.ngo_map_link,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapDonationRow(row) {
  return {
    id: row.id,
    donationUuid: row.donation_uuid,
    requestId: row.request_id,
    requestUuid: row.request_uuid,
    donorName: row.donor_name,
    donorPhone: row.donor_phone,
    donorEmail: row.donor_email,
    itemName: row.item_name,
    quantity: row.quantity,
    pickupAddress: row.pickup_address,
    notes: row.notes,
    emailStatus: row.email_status,
    createdAt: row.created_at,
  };
}

async function readRequestById(requestId) {
  const [rows] = await getPool().query(
    `SELECT id, request_uuid, ngo_id, ngo_name, ngo_location, ngo_map_link, item_name, category, quantity,
            needed_quantity_value, quantity_unit, received_quantity_value, description, image_url, contact_email,
            urgent, status, created_at
     FROM ngo_requests
     WHERE id = ?`,
    [requestId],
  );

  return rows[0] ? mapRequestRow(rows[0]) : null;
}

async function getSessionPayload(req) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return null;
  }

  if (session.role === 'admin') {
    return {
      role: 'admin',
      email: ADMIN_EMAIL,
      token: session.session_token,
    };
  }

  return {
    role: 'ngo',
    token: session.session_token,
    ngo: {
      id: session.ngo_id,
      ngoUuid: session.ngo_uuid,
      ngoName: session.ngo_name,
      email: session.email,
      ngoLocation: session.ngo_location,
      ngoMapLink: session.ngo_map_link,
      status: session.status,
    },
  };
}

async function requireSession(req, res, next) {
  const session = await getSessionPayload(req);

  if (!session) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  req.session = session;
  next();
}

async function requireNgo(req, res, next) {
  await requireSession(req, res, () => {
    if (req.session?.role !== 'ngo') {
      return res.status(403).json({ message: 'NGO access required.' });
    }

    next();
  });
}

async function requireAdmin(req, res, next) {
  await requireSession(req, res, () => {
    if (req.session?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    next();
  });
}

app.get('/api/health', async (_req, res) => {
  const [rows] = await getPool().query('SELECT 1 AS ok');
  res.json({ ok: rows[0]?.ok === 1, categories: allowedCategories });
});

app.get('/api/auth/session', requireSession, async (req, res) => {
  res.json(req.session);
});

app.post('/api/auth/logout', requireSession, async (req, res) => {
  await deleteSession(req.session.token);
  res.json({ ok: true });
});

app.post('/api/ngo/register', async (req, res) => {
  const errors = validateNgoRegistrationPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const email = req.body.email.trim().toLowerCase();
  const [existingRows] = await getPool().query('SELECT id FROM ngos WHERE email = ? LIMIT 1', [email]);

  if (existingRows.length > 0) {
    return res.status(409).json({ message: 'An NGO account with this email already exists.' });
  }

  const passwordHash = await hashPassword(req.body.password.trim());
  const ngoUuid = randomUUID();

  const [result] = await getPool().query(
    `INSERT INTO ngos (ngo_uuid, ngo_name, email, password_hash, ngo_location, ngo_map_link, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [
      ngoUuid,
      req.body.ngoName.trim(),
      email,
      passwordHash,
      req.body.ngoLocation.trim(),
      req.body.ngoMapLink?.trim() || null,
    ],
  );

  const [rows] = await getPool().query(
    `SELECT id, ngo_uuid, ngo_name, email, ngo_location, ngo_map_link, status, created_at
     FROM ngos
     WHERE id = ?`,
    [result.insertId],
  );

  res.status(201).json({
    message: 'NGO registration submitted. Admin approval is required before posting requests.',
    ngo: mapNgoRow(rows[0]),
  });
});

app.post('/api/ngo/login', async (req, res) => {
  const errors = validateLoginPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const email = req.body.email.trim().toLowerCase();
  const [rows] = await getPool().query(
    `SELECT id, ngo_uuid, ngo_name, email, password_hash, ngo_location, ngo_map_link, status, created_at
     FROM ngos
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  if (rows.length === 0 || !(await verifyPassword(req.body.password, rows[0].password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = await createSession({ role: 'ngo', ngoId: rows[0].id });

  res.json({
    token,
    role: 'ngo',
    ngo: mapNgoRow(rows[0]),
  });
});

app.post('/api/admin/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password.trim();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const token = await createSession({ role: 'admin' });
  res.json({
    token,
    role: 'admin',
    email: ADMIN_EMAIL,
  });
});

app.get('/api/ngo/requests', requireNgo, async (req, res) => {
  const [rows] = await getPool().query(
    `SELECT id, request_uuid, ngo_id, ngo_name, ngo_location, ngo_map_link, item_name, category, quantity,
            needed_quantity_value, quantity_unit, received_quantity_value, description, image_url, contact_email,
            urgent, status, created_at
     FROM ngo_requests
     WHERE ngo_id = ?
     ORDER BY created_at DESC`,
    [req.session.ngo.id],
  );

  res.json(rows.map(mapRequestRow));
});

app.get('/api/requests', async (_req, res) => {
  const [rows] = await getPool().query(
    `SELECT id, request_uuid, ngo_id, ngo_name, ngo_location, ngo_map_link, item_name, category, quantity,
            needed_quantity_value, quantity_unit, received_quantity_value, description, image_url, contact_email,
            urgent, status, created_at
     FROM ngo_requests
     WHERE status = 'approved'
     ORDER BY urgent DESC, created_at DESC`,
  );

  res.json(rows.map(mapRequestRow));
});

app.post('/api/requests', requireNgo, async (req, res) => {
  if (req.session.ngo.status !== 'approved') {
    return res.status(403).json({ message: 'Your NGO account is not approved yet.' });
  }

  const errors = validateRequestPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const requestUuid = randomUUID();
  const parsedQuantity = parseQuantity(req.body.quantity);
  const payload = {
    ngoId: req.session.ngo.id,
    ngoName: req.session.ngo.ngoName,
    ngoLocation: req.session.ngo.ngoLocation,
    ngoMapLink: req.session.ngo.ngoMapLink || req.body.ngoMapLink?.trim() || null,
    itemName: req.body.itemName.trim(),
    category: req.body.category,
    quantity: req.body.quantity.trim(),
    neededQuantityValue: parsedQuantity.numericValue,
    quantityUnit: parsedQuantity.unit,
    description: req.body.description.trim(),
    image: req.body.image?.trim() || null,
    contact: req.body.contact.trim().toLowerCase(),
    urgent: Boolean(req.body.urgent),
    status: 'pending',
  };

  const [result] = await getPool().query(
    `INSERT INTO ngo_requests
      (request_uuid, ngo_id, ngo_name, ngo_location, ngo_map_link, item_name, category, quantity,
       needed_quantity_value, quantity_unit, received_quantity_value, description, image_url, contact_email, urgent, status)
     VALUES
      (:requestUuid, :ngoId, :ngoName, :ngoLocation, :ngoMapLink, :itemName, :category, :quantity,
       :neededQuantityValue, :quantityUnit, 0, :description, :image, :contact, :urgent, :status)`,
    {
      requestUuid,
      ...payload,
    },
  );

  const createdRequest = await readRequestById(result.insertId);
  res.status(201).json(createdRequest);
});

app.post('/api/donations', async (req, res) => {
  const errors = validateDonationPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const donationUuid = randomUUID();
  const payload = {
    requestId: req.body.requestId || null,
    requestUuid: req.body.requestUuid || null,
    donorName: req.body.name.trim(),
    donorPhone: req.body.phone.trim(),
    donorEmail: req.body.email.trim().toLowerCase(),
    itemName: req.body.item.trim(),
    quantity: req.body.quantity.trim(),
    pickupAddress: req.body.address.trim(),
    notes: req.body.notes?.trim() || null,
  };

  let linkedRequest = null;
  if (payload.requestId) {
    linkedRequest = await readRequestById(payload.requestId);
  }

  let emailStatus = 'sent';
  let emailMeta = null;

  try {
    emailMeta = await sendDonationConfirmation({
      donorEmail: payload.donorEmail,
      donorName: payload.donorName,
      item: payload.itemName,
      quantity: payload.quantity,
      donationUuid,
    });

    if (emailMeta.preview) {
      emailStatus = 'previewed';
      console.log('Donation email preview:\n', emailMeta.preview);
    }
  } catch (error) {
    emailStatus = 'failed';
    console.error('Failed to send donation email:', error);
  }

  await getPool().query(
    `INSERT INTO donations
      (donation_uuid, request_id, request_uuid, donor_name, donor_phone, donor_email, item_name, quantity, pickup_address, notes, email_status)
     VALUES
      (:donationUuid, :requestId, :requestUuid, :donorName, :donorPhone, :donorEmail, :itemName, :quantity, :pickupAddress, :notes, :emailStatus)`,
    {
      donationUuid,
      ...payload,
      emailStatus,
    },
  );

  if (linkedRequest?.neededQuantityValue !== null) {
    const donated = parseQuantity(payload.quantity);
    const donatedUnit = normalizeQuantityUnit(donated.unit, payload.itemName);
    const requestUnit = normalizeQuantityUnit(linkedRequest.quantityUnit, linkedRequest.itemName);
    const sameUnit = donatedUnit === requestUnit;

    if (donated.numericValue !== null && sameUnit) {
      const newReceived = linkedRequest.receivedQuantityValue + donated.numericValue;
      const nextStatus = newReceived >= linkedRequest.neededQuantityValue ? 'fulfilled' : linkedRequest.status;

      await getPool().query(
        `UPDATE ngo_requests
         SET received_quantity_value = ?, status = ?
         WHERE id = ?`,
        [newReceived, nextStatus, linkedRequest.id],
      );

      linkedRequest = await readRequestById(linkedRequest.id);
    } else {
      console.log('[donation] Quantity progress not updated', {
        requestId: linkedRequest.id,
        donatedQuantity: payload.quantity,
        requestQuantity: linkedRequest.quantity,
        donatedUnit,
        requestUnit,
        donatedNumericValue: donated.numericValue,
      });
    }
  }

  return res.status(201).json({
    donationUuid,
    emailStatus,
    linkedRequest,
    message: emailStatus === 'failed'
      ? 'Donation saved, but confirmation email could not be sent.'
      : 'Donation saved successfully.',
  });
});

app.get('/api/admin/dashboard', requireAdmin, async (_req, res) => {
  const [[ngoCounts]] = await getPool().query(
    `SELECT
       SUM(status = 'pending') AS pendingNgos,
       SUM(status = 'approved') AS approvedNgos,
       SUM(status = 'rejected') AS rejectedNgos
     FROM ngos`,
  );
  const [[requestCounts]] = await getPool().query(
    `SELECT
       SUM(status = 'pending') AS pendingRequests,
       SUM(status = 'approved') AS approvedRequests,
       SUM(status = 'rejected') AS rejectedRequests,
       SUM(status = 'spam') AS spamRequests,
       SUM(status = 'fulfilled') AS fulfilledRequests
     FROM ngo_requests`,
  );
  const [[donationCounts]] = await getPool().query(
    `SELECT COUNT(*) AS totalDonations
     FROM donations`,
  );

  res.json({
    ngoCounts,
    requestCounts,
    donationCounts,
  });
});

app.get('/api/admin/ngos', requireAdmin, async (req, res) => {
  const requestedStatus = req.query.status;

  if (requestedStatus && !validateStatusUpdate(requestedStatus, ngoStatusOptions)) {
    return res.status(400).json({ message: 'Invalid NGO status filter.' });
  }

  const [rows] = requestedStatus
    ? await getPool().query(
      `SELECT id, ngo_uuid, ngo_name, email, ngo_location, ngo_map_link, status, created_at
       FROM ngos
       WHERE status = ?
       ORDER BY created_at DESC`,
      [requestedStatus],
    )
    : await getPool().query(
      `SELECT id, ngo_uuid, ngo_name, email, ngo_location, ngo_map_link, status, created_at
       FROM ngos
       ORDER BY created_at DESC`,
    );

  res.json(rows.map(mapNgoRow));
});

app.patch('/api/admin/ngos/:id/status', requireAdmin, async (req, res) => {
  const nextStatus = String(req.body.status || '').trim().toLowerCase();

  if (!validateStatusUpdate(nextStatus, ngoStatusOptions)) {
    return res.status(400).json({ message: 'Invalid NGO status.' });
  }

  await getPool().query('UPDATE ngos SET status = ? WHERE id = ?', [nextStatus, req.params.id]);

  const [rows] = await getPool().query(
    `SELECT id, ngo_uuid, ngo_name, email, ngo_location, ngo_map_link, status, created_at
     FROM ngos
     WHERE id = ?`,
    [req.params.id],
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'NGO account not found.' });
  }

  res.json(mapNgoRow(rows[0]));
});

app.get('/api/admin/requests', requireAdmin, async (req, res) => {
  const requestedStatus = req.query.status;

  if (requestedStatus && !validateStatusUpdate(requestedStatus, requestStatusOptions)) {
    return res.status(400).json({ message: 'Invalid request status filter.' });
  }

  const [rows] = requestedStatus
    ? await getPool().query(
      `SELECT id, request_uuid, ngo_id, ngo_name, ngo_location, ngo_map_link, item_name, category, quantity,
              needed_quantity_value, quantity_unit, received_quantity_value, description, image_url, contact_email,
              urgent, status, created_at
       FROM ngo_requests
       WHERE status = ?
       ORDER BY created_at DESC`,
      [requestedStatus],
    )
    : await getPool().query(
      `SELECT id, request_uuid, ngo_id, ngo_name, ngo_location, ngo_map_link, item_name, category, quantity,
              needed_quantity_value, quantity_unit, received_quantity_value, description, image_url, contact_email,
              urgent, status, created_at
       FROM ngo_requests
       ORDER BY created_at DESC`,
    );

  res.json(rows.map(mapRequestRow));
});

app.patch('/api/admin/requests/:id/status', requireAdmin, async (req, res) => {
  const nextStatus = String(req.body.status || '').trim().toLowerCase();

  if (!validateStatusUpdate(nextStatus, requestStatusOptions)) {
    return res.status(400).json({ message: 'Invalid request status.' });
  }

  await getPool().query('UPDATE ngo_requests SET status = ? WHERE id = ?', [nextStatus, req.params.id]);
  const updatedRequest = await readRequestById(req.params.id);

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  res.json(updatedRequest);
});

app.get('/api/admin/donations', requireAdmin, async (_req, res) => {
  const [rows] = await getPool().query(
    `SELECT id, donation_uuid, request_id, request_uuid, donor_name, donor_phone, donor_email, item_name,
            quantity, pickup_address, notes, email_status, created_at
     FROM donations
     ORDER BY created_at DESC`,
  );

  res.json(rows.map(mapDonationRow));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

async function startServer() {
  logStartup('Loading configuration', {
    port: PORT,
    adminEmail: ADMIN_EMAIL,
    mysqlHost: process.env.MYSQL_HOST || 'localhost',
    mysqlPort: Number(process.env.MYSQL_PORT || 3306),
    mysqlDatabase: process.env.MYSQL_DATABASE || 'hope_hands',
  });

  logStartup('Initializing database');
  await initializeDatabase();
  logStartup('Database initialization complete');

  logStartup(`Starting HTTP server on port ${PORT}`);
  app.listen(PORT, () => {
    logStartup(`HopeHands API is running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[startup][api] Failed to start server:', error);
  process.exit(1);
});
