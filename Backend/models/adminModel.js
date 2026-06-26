import db from '../config/database.js';

const normEmail = (e) => (e || '').trim().toLowerCase();

export const adminModel = {
  findByEmail: async (email) => {
    const normalized = normEmail(email);
    const [rows] = await db.execute(
      'SELECT * FROM admins WHERE LOWER(TRIM(email)) = ? LIMIT 1',
      [normalized]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT id, email, name FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  },

  count: async () => {
    const [rows] = await db.execute('SELECT COUNT(*) AS n FROM admins');
    return Number(rows[0]?.n || 0);
  },

  create: async ({ email, hashed_password, name = 'Admin' }) => {
    const [result] = await db.execute(
      'INSERT INTO admins (email, hashed_password, name) VALUES (?, ?, ?)',
      [normEmail(email), hashed_password, name]
    );
    return result.insertId;
  },

  updatePassword: async (id, hashed_password) => {
    await db.execute('UPDATE admins SET hashed_password = ? WHERE id = ?', [
      hashed_password,
      id,
    ]);
    return true;
  },
};
