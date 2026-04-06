import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getPool } from './db.js';

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_DAYS = 7;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, key] = String(storedHash || '').split(':');

  if (!salt || !key) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, 64);
  const storedBuffer = Buffer.from(key, 'hex');
  const candidateBuffer = Buffer.from(derivedKey);

  return storedBuffer.length === candidateBuffer.length && timingSafeEqual(storedBuffer, candidateBuffer);
}

export async function createSession({ role, ngoId = null }) {
  const sessionToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await getPool().query(
    `INSERT INTO auth_sessions (session_token, role, ngo_id, expires_at)
     VALUES (?, ?, ?, ?)`,
    [sessionToken, role, ngoId, expiresAt],
  );

  return sessionToken;
}

export async function getSessionFromRequest(req) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return null;
  }

  const [rows] = await getPool().query(
    `SELECT s.id, s.session_token, s.role, s.ngo_id, s.expires_at,
            n.ngo_uuid, n.ngo_name, n.email, n.ngo_location, n.ngo_map_link, n.status
     FROM auth_sessions s
     LEFT JOIN ngos n ON n.id = s.ngo_id
     WHERE s.session_token = ?
       AND s.expires_at > NOW()
     LIMIT 1`,
    [token],
  );

  return rows[0] || null;
}

export async function deleteSession(token) {
  await getPool().query('DELETE FROM auth_sessions WHERE session_token = ?', [token]);
}
