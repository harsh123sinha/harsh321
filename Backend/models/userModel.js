import db from '../config/database.js';

export const userModel = {
  // Create new user
  create: async (userData) => {
    const { name, email, password, role, phone_number } = userData;
    const query = `
      INSERT INTO user (name, email, password, role, phone_number, accept_terms, terms_accepted_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW())
    `;
    const [result] = await db.execute(query, [name, email, password, role, phone_number]);
    return result.insertId;
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM user WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT id, name, email, role, phone_number FROM user WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  // Get all users (for admin)
  getAll: async () => {
    const query = 'SELECT id, name, email, role, phone_number, terms_accepted_at FROM user ORDER BY id DESC';
    const [rows] = await db.execute(query);
    return rows;
  },

  // Update user
  update: async (id, userData) => {
    const { name, email, role, phone_number } = userData;
    const query = 'UPDATE user SET name = ?, email = ?, role = ?, phone_number = ? WHERE id = ?';
    await db.execute(query, [name, email, role, phone_number, id]);
    return true;
  },

  // Update password
  updatePassword: async (email, hashedPassword) => {
    const query = 'UPDATE user SET password = ? WHERE email = ?';
    await db.execute(query, [hashedPassword, email]);
    return true;
  },

  updatePasswordById: async (id, hashedPassword) => {
    const query = 'UPDATE user SET password = ? WHERE id = ?';
    await db.execute(query, [hashedPassword, id]);
    return true;
  },

  // Delete user
  delete: async (id) => {
    const query = 'DELETE FROM user WHERE id = ?';
    await db.execute(query, [id]);
    return true;
  },

  // Get user count
  getCount: async () => {
    const query = 'SELECT COUNT(*) as count FROM user';
    const [rows] = await db.execute(query);
    return rows[0].count;
  },
};
