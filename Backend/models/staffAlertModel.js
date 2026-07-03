import db from '../config/database.js';

export const staffAlertModel = {
  create: async ({ category, title, body, link_path, reference_id }) => {
    const [result] = await db.execute(
      `INSERT INTO staff_alerts (category, title, body, link_path, reference_id)
       VALUES (?, ?, ?, ?, ?)`,
      [category, title, body || null, link_path || null, reference_id ?? null]
    );
    return result.insertId;
  },

  listRecent: async (limit = 30) => {
    const lim = Math.min(Math.max(Number(limit) || 30, 1), 100);
    const [rows] = await db.execute(
      `SELECT * FROM staff_alerts ORDER BY created_at DESC, id DESC LIMIT ${lim}`
    );
    return rows;
  },

  unreadCount: async () => {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS n FROM staff_alerts WHERE is_read = 0`
    );
    return Number(rows[0]?.n) || 0;
  },

  markRead: async (id) => {
    await db.execute(`UPDATE staff_alerts SET is_read = 1 WHERE id = ?`, [id]);
  },

  markAllRead: async () => {
    await db.execute(`UPDATE staff_alerts SET is_read = 1 WHERE is_read = 0`);
  },
};
