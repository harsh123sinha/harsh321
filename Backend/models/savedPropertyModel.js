import db from '../config/database.js';

export const savedPropertyModel = {
  getIdsByUserId: async (userId) => {
    const [rows] = await db.execute(
      'SELECT property_id FROM saved_properties WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map((r) => r.property_id);
  },

  findByUserId: async (userId) => {
    const query = `
      SELECT p.*, u.name AS owner_name, u.role AS owner_role, u.phone_number AS owner_phone,
             sp.saved_price, sp.created_at AS saved_at
      FROM saved_properties sp
      INNER JOIN properties p ON p.id = sp.property_id
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE sp.user_id = ?
      ORDER BY sp.created_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  },

  isSaved: async (userId, propertyId) => {
    const [rows] = await db.execute(
      'SELECT id FROM saved_properties WHERE user_id = ? AND property_id = ? LIMIT 1',
      [userId, propertyId]
    );
    return rows.length > 0;
  },

  add: async (userId, propertyId, savedPrice) => {
    const [result] = await db.execute(
      `INSERT INTO saved_properties (user_id, property_id, saved_price)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE saved_price = VALUES(saved_price)`,
      [userId, propertyId, savedPrice ?? null]
    );
    return result.insertId || result.affectedRows;
  },

  remove: async (userId, propertyId) => {
    const [result] = await db.execute(
      'DELETE FROM saved_properties WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    return result.affectedRows > 0;
  },
};
