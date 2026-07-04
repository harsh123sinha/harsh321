import db from '../config/database.js';

function sqlLimit(limit, fallback = 20, max = 50) {
  const n = Number.parseInt(String(limit), 10);
  const safe = Number.isFinite(n) && n > 0 ? n : fallback;
  return Math.min(safe, max);
}

function sqlOffset(page, limit) {
  const p = Math.max(Number.parseInt(String(page), 10) || 1, 1);
  return (p - 1) * limit;
}

export const notificationModel = {
  create: async ({ userId, type, title, body, data, referenceKey }) => {
    const dataJson = data ? JSON.stringify(data) : null;
    try {
      const [result] = await db.execute(
        `INSERT INTO notifications (user_id, type, title, body, data_json, reference_key)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, type, title, body, dataJson, referenceKey]
      );
      const [rows] = await db.execute('SELECT * FROM notifications WHERE id = ?', [
        result.insertId,
      ]);
      return rows[0];
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return null;
      throw err;
    }
  },

  markPushSent: async (id) => {
    await db.execute(
      'UPDATE notifications SET push_sent = 1, push_sent_at = NOW() WHERE id = ?',
      [id]
    );
    return true;
  },

  listForUser: async (userId, { page = 1, limit = 20 } = {}) => {
    const lim = sqlLimit(limit);
    const offset = sqlOffset(page, lim);
    const [rows] = await db.execute(
      `SELECT id, user_id, type, title, body, data_json, reference_key, is_read, push_sent, created_at
       FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ${lim} OFFSET ${offset}`,
      [userId]
    );
    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
      [userId]
    );
    return { notifications: rows.map(parseRow), total: countRows[0].total };
  },

  unreadCount: async (userId) => {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return Number(rows[0].count) || 0;
  },

  markRead: async (userId, notificationId) => {
    const [result] = await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  },

  markAllRead: async (userId) => {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [
      userId,
    ]);
    return true;
  },

  exists: async (userId, type, referenceKey) => {
    const [rows] = await db.execute(
      'SELECT id FROM notifications WHERE user_id = ? AND type = ? AND reference_key = ? LIMIT 1',
      [userId, type, referenceKey]
    );
    return rows[0] || null;
  },
};

function parseRow(row) {
  if (!row) return row;
  let data = null;
  if (row.data_json) {
    try {
      data = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
    } catch {
      data = null;
    }
  }
  return { ...row, data_json: undefined, data };
}
