import mysql from 'mysql2/promise';

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'hope_hands',
} = process.env;

const poolConfig = {
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
};

let pool;

const logStartup = (message, extra) => {
  const prefix = '[startup][db]';

  if (extra !== undefined) {
    console.log(prefix, message, extra);
    return;
  }

  console.log(prefix, message);
};

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS ngos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ngo_uuid CHAR(36) NOT NULL UNIQUE,
    ngo_name VARCHAR(180) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ngo_location VARCHAR(255) NOT NULL,
    ngo_map_link VARCHAR(500) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS auth_sessions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_token CHAR(64) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    ngo_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_auth_session_ngo
      FOREIGN KEY (ngo_id) REFERENCES ngos(id)
      ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS ngo_requests (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    request_uuid CHAR(36) NOT NULL UNIQUE,
    ngo_id INT NULL,
    ngo_name VARCHAR(180) NOT NULL,
    ngo_location VARCHAR(255) NOT NULL,
    ngo_map_link VARCHAR(500) NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    quantity VARCHAR(120) NOT NULL,
    needed_quantity_value DECIMAL(10,2) NULL,
    quantity_unit VARCHAR(50) NULL,
    received_quantity_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    contact_email VARCHAR(255) NOT NULL,
    urgent BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_ngo
      FOREIGN KEY (ngo_id) REFERENCES ngos(id)
      ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS donations (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    donation_uuid CHAR(36) NOT NULL UNIQUE,
    request_id INT NULL,
    request_uuid CHAR(36) NULL,
    donor_name VARCHAR(150) NOT NULL,
    donor_phone VARCHAR(40) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity VARCHAR(120) NOT NULL,
    pickup_address TEXT NOT NULL,
    notes TEXT NULL,
    email_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation_request
      FOREIGN KEY (request_id) REFERENCES ngo_requests(id)
      ON DELETE SET NULL
  )`,
];

const requestColumnMigrations = [
  {
    columnName: 'ngo_id',
    definition: 'INT NULL AFTER request_uuid',
  },
  {
    columnName: 'ngo_name',
    definition: "VARCHAR(180) NOT NULL DEFAULT 'HopeHands Partner NGO' AFTER request_uuid",
  },
  {
    columnName: 'ngo_location',
    definition: "VARCHAR(255) NOT NULL DEFAULT 'Pune, Maharashtra' AFTER ngo_name",
  },
  {
    columnName: 'ngo_map_link',
    definition: 'VARCHAR(500) NULL AFTER ngo_location',
  },
  {
    columnName: 'needed_quantity_value',
    definition: 'DECIMAL(10,2) NULL AFTER quantity',
  },
  {
    columnName: 'quantity_unit',
    definition: 'VARCHAR(50) NULL AFTER needed_quantity_value',
  },
  {
    columnName: 'received_quantity_value',
    definition: 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER quantity_unit',
  },
];

const requestIndexes = [
  {
    name: 'fk_request_ngo',
    sql: 'ALTER TABLE ngo_requests ADD CONSTRAINT fk_request_ngo FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE SET NULL',
  },
];

async function addConstraintIfMissing(constraintName, sql) {
  logStartup(`Checking constraint ${constraintName}`);
  const [rows] = await pool.query(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = ?
       AND CONSTRAINT_NAME = ?
     LIMIT 1`,
    [MYSQL_DATABASE, constraintName],
  );

  if (rows.length === 0) {
    logStartup(`Adding constraint ${constraintName}`);
    await pool.query(sql);
    logStartup(`Added constraint ${constraintName}`);
  }
}

async function addColumnIfMissing(tableName, columnName, definition) {
  logStartup(`Checking column ${tableName}.${columnName}`);
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [MYSQL_DATABASE, tableName, columnName],
  );

  if (rows.length === 0) {
    logStartup(`Adding column ${tableName}.${columnName}`);
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    logStartup(`Added column ${tableName}.${columnName}`);
  }
}

export async function initializeDatabase() {
  let bootstrapConnection;

  try {
    logStartup('Opening bootstrap MySQL connection', {
      host: MYSQL_HOST,
      port: Number(MYSQL_PORT),
      user: MYSQL_USER,
      database: MYSQL_DATABASE,
    });

    bootstrapConnection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: Number(MYSQL_PORT),
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      multipleStatements: true,
      connectTimeout: 10000,
    });

    logStartup('Bootstrap connection established');

    await bootstrapConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    logStartup(`Ensured database ${MYSQL_DATABASE} exists`);
  } catch (error) {
    console.error('[startup][db] Bootstrap connection failed:', error);
    throw error;
  } finally {
    if (bootstrapConnection) {
      await bootstrapConnection.end().catch((error) => {
        console.error('[startup][db] Failed to close bootstrap connection:', error);
      });
      logStartup('Bootstrap connection closed');
    }
  }

  try {
    logStartup('Creating MySQL pool');
    pool = mysql.createPool({
      ...poolConfig,
      database: MYSQL_DATABASE,
    });

    logStartup('Pinging MySQL pool');
    await Promise.race([
      pool.query('SELECT 1'),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timed out while waiting for the MySQL pool to respond.')), 10000);
      }),
    ]);
    logStartup('MySQL pool is responsive');

    for (const [index, statement] of schemaStatements.entries()) {
      logStartup(`Running schema statement ${index + 1}/${schemaStatements.length}`);
      await pool.query(statement);
    }
    logStartup('Base schema ensured');

    for (const migration of requestColumnMigrations) {
      await addColumnIfMissing('ngo_requests', migration.columnName, migration.definition);
    }
    logStartup('Column migrations complete');

    for (const constraint of requestIndexes) {
      await addConstraintIfMissing(constraint.name, constraint.sql);
    }
    logStartup('Constraint checks complete');

    return pool;
  } catch (error) {
    console.error('[startup][db] Database initialization failed:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized yet.');
  }

  return pool;
}
