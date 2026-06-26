import db from '../config/database.js';

/** Bcrypt hash for default admin (password set at project setup — change via DB update). */
const DEFAULT_ADMIN_EMAIL = 'harshsinha.user2002@gmail.com';
const DEFAULT_ADMIN_HASH =
  '$2a$10$0i3NbNVj8t4nX8QgIyOjL.dm.jyTskJIVV/PxE.ktTmHrKh7hn4HO';

async function hasTable(tableName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return Number(rows[0]?.n) > 0;
}

/**
 * Creates `admins` table and seeds the primary admin when empty.
 */
export async function ensureAdminSchema() {
  if (!(await hasTable('admins'))) {
    await db.execute(`
      CREATE TABLE admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NULL DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created admins table');
  }

  const [countRows] = await db.execute('SELECT COUNT(*) AS n FROM admins');
  const count = Number(countRows[0]?.n || 0);

  if (count === 0) {
    await db.execute(
      'INSERT INTO admins (email, hashed_password, name) VALUES (?, ?, ?)',
      [DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_HASH, 'Admin']
    );
    console.log(`✅ DB: seeded default admin (${DEFAULT_ADMIN_EMAIL})`);
  }
}
