import db from '../config/database.js';

export const missionRegistrationModel = {
  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO mission_registrations
       (name, mobile, email, group_mode, group_code, area, pincode, bhk, floor_pref,
        family_size, funds_range, timeline, consent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.mobile,
        data.email || null,
        data.group_mode,
        data.group_code || null,
        data.area || null,
        data.pincode || null,
        data.bhk,
        data.floor_pref || null,
        data.family_size || null,
        data.funds_range,
        data.timeline || null,
        data.consent ? 1 : 0,
      ]
    );
    return result.insertId;
  },

  findAll: async ({ status, q, limit = 200 } = {}) => {
    let sql = `SELECT * FROM mission_registrations WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (q && String(q).trim()) {
      const pat = `%${String(q).trim()}%`;
      sql += ` AND (name LIKE ? OR mobile LIKE ? OR email LIKE ? OR area LIKE ? OR group_code LIKE ?)`;
      params.push(pat, pat, pat, pat, pat);
    }

    const lim = Math.min(Math.max(Number(limit) || 200, 1), 500);
    sql += ` ORDER BY created_at DESC, id DESC LIMIT ${lim}`;

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  updateStatus: async (id, status) => {
    await db.execute(`UPDATE mission_registrations SET status = ? WHERE id = ?`, [status, id]);
  },
};
