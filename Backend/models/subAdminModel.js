import db from '../config/database.js';

export const subAdminModel = {
  // Find sub-admin by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM sub_admins WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },

  // Find sub-admin by ID
  findById: async (id) => {
    const query = 'SELECT id, name, email FROM sub_admins WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  // Get all sub-admins
  getAll: async () => {
    const query = 'SELECT id, name, email FROM sub_admins ORDER BY id DESC';
    const [rows] = await db.execute(query);
    return rows;
  },

  // Create new sub-admin
  create: async (subAdminData) => {
    const { name, email, password, hashed_password } = subAdminData;
    const query = `
      INSERT INTO sub_admins (name, email, password, hashed_password)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, email, password || '', hashed_password]);
    return result.insertId;
  },

  // Update sub-admin
  update: async (id, subAdminData) => {
    const { name, email, hashed_password } = subAdminData;

    if (hashed_password) {
      const query = 'UPDATE sub_admins SET name = ?, email = ?, hashed_password = ? WHERE id = ?';
      await db.execute(query, [name, email, hashed_password, id]);
    } else {
      const query = 'UPDATE sub_admins SET name = ?, email = ? WHERE id = ?';
      await db.execute(query, [name, email, id]);
    }

    return true;
  },

  // Delete sub-admin
  delete: async (id) => {
    const query = 'DELETE FROM sub_admins WHERE id = ?';
    await db.execute(query, [id]);
    return true;
  },
};
