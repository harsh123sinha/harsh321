import db from '../config/database.js';

export const userDemandModel = {
  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO user_demands
       (contact_phone, contact_name, category, listing_type, requirements, location, city,
        bhk, floor_pref, facing, furnishing, shop_sqft_range, katha, budget_min, budget_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.contact_phone,
        data.contact_name || null,
        data.category,
        data.listing_type || null,
        data.requirements || null,
        data.location || null,
        data.city || null,
        data.bhk || null,
        data.floor_pref || null,
        data.facing || null,
        data.furnishing || null,
        data.shop_sqft_range || null,
        data.katha || null,
        data.budget_min ?? null,
        data.budget_max ?? null,
      ]
    );
    return result.insertId;
  },

  findAll: async ({ status, q, limit = 200 } = {}) => {
    let sql = `SELECT * FROM user_demands WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (q && String(q).trim()) {
      const pat = `%${String(q).trim()}%`;
      sql += ` AND (
        contact_phone LIKE ? OR contact_name LIKE ? OR location LIKE ?
        OR city LIKE ? OR category LIKE ? OR requirements LIKE ?
      )`;
      params.push(pat, pat, pat, pat, pat, pat);
    }

    const lim = Math.min(Math.max(Number(limit) || 200, 1), 500);
    sql += ` ORDER BY created_at DESC, id DESC LIMIT ${lim}`;

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  updateStatus: async (id, status) => {
    await db.execute(`UPDATE user_demands SET status = ? WHERE id = ?`, [status, id]);
  },
};
