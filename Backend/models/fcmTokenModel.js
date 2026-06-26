import db from '../config/database.js';

export const fcmTokenModel = {
  upsert: async (userId, fcmToken, meta = {}) => {
    const { deviceLabel, userAgent } = meta;
    const query = `
      INSERT INTO user_fcm_tokens (user_id, fcm_token, device_label, user_agent, last_used_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        device_label = COALESCE(VALUES(device_label), device_label),
        user_agent = COALESCE(VALUES(user_agent), user_agent),
        last_used_at = NOW()
    `;
    await db.execute(query, [userId, fcmToken, deviceLabel || null, userAgent || null]);
    return true;
  },

  findByUserId: async (userId) => {
    const [rows] = await db.execute(
      'SELECT * FROM user_fcm_tokens WHERE user_id = ? ORDER BY last_used_at DESC',
      [userId]
    );
    return rows;
  },

  deleteToken: async (fcmToken) => {
    await db.execute('DELETE FROM user_fcm_tokens WHERE fcm_token = ?', [fcmToken]);
    return true;
  },

  deleteByUserAndToken: async (userId, fcmToken) => {
    await db.execute('DELETE FROM user_fcm_tokens WHERE user_id = ? AND fcm_token = ?', [
      userId,
      fcmToken,
    ]);
    return true;
  },

  deleteAllForUser: async (userId) => {
    await db.execute('DELETE FROM user_fcm_tokens WHERE user_id = ?', [userId]);
    return true;
  },
};
