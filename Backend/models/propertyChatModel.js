import db from '../config/database.js';

const CHAT_LIST_SELECT = `
  SELECT c.*,
    p.title AS property_title,
    p.image_url AS property_image_url,
    p.location AS property_location,
    p.city AS property_city,
    p.type AS property_type,
    p.other_type AS property_other_type,
    p.listing_kind AS property_listing_kind,
    p.listed_by_staff AS property_listed_by_staff,
    buyer.name AS buyer_name,
    buyer.phone_number AS buyer_phone,
    recipient.name AS recipient_name,
    recipient.role AS recipient_role
  FROM property_chats c
  JOIN properties p ON p.id = c.property_id
  JOIN user buyer ON buyer.id = c.buyer_user_id
  LEFT JOIN user recipient ON recipient.id = c.recipient_user_id
`;

export const propertyChatModel = {
  findById: async (id) => {
    const [rows] = await db.execute(`${CHAT_LIST_SELECT} WHERE c.id = ?`, [id]);
    return rows[0] || null;
  },

  findByPropertyAndBuyer: async (propertyId, buyerUserId) => {
    const [rows] = await db.execute(
      `${CHAT_LIST_SELECT} WHERE c.property_id = ? AND c.buyer_user_id = ?`,
      [propertyId, buyerUserId]
    );
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO property_chats
       (property_id, buyer_user_id, channel, recipient_user_id, listed_by_staff, last_message_preview)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.property_id,
        data.buyer_user_id,
        data.channel,
        data.recipient_user_id || null,
        data.listed_by_staff || null,
        data.last_message_preview || null,
      ]
    );
    return result.insertId;
  },

  listForUser: async (userId) => {
    const [rows] = await db.execute(
      `${CHAT_LIST_SELECT}
       WHERE c.buyer_user_id = ? OR c.recipient_user_id = ?
       ORDER BY c.updated_at DESC, c.id DESC
       LIMIT 200`,
      [userId, userId]
    );
    return rows;
  },

  listForBuyer: async (buyerUserId) => {
    const [rows] = await db.execute(
      `${CHAT_LIST_SELECT}
       WHERE c.buyer_user_id = ?
       ORDER BY c.updated_at DESC, c.id DESC
       LIMIT 200`,
      [buyerUserId]
    );
    return rows;
  },

  listForRecipient: async (recipientUserId) => {
    const [rows] = await db.execute(
      `${CHAT_LIST_SELECT}
       WHERE c.recipient_user_id = ?
       ORDER BY c.updated_at DESC, c.id DESC
       LIMIT 200`,
      [recipientUserId]
    );
    return rows;
  },

  listForStaff: async () => {
    const [rows] = await db.execute(
      `${CHAT_LIST_SELECT}
       WHERE c.channel = 'staff'
       ORDER BY c.updated_at DESC, c.id DESC
       LIMIT 300`
    );
    return rows;
  },

  addMessage: async ({
    chatId,
    senderKind,
    senderUserId,
    senderStaffId,
    senderStaffRole,
    body,
  }) => {
    const [result] = await db.execute(
      `INSERT INTO property_chat_messages
       (chat_id, sender_kind, sender_user_id, sender_staff_id, sender_staff_role, body)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        chatId,
        senderKind,
        senderUserId || null,
        senderStaffId || null,
        senderStaffRole || null,
        body,
      ]
    );

    const preview = String(body).slice(0, 500);
    let unreadSql = '';
    if (senderKind === 'buyer') {
      const chat = await propertyChatModel.findById(chatId);
      if (chat?.channel === 'staff') {
        unreadSql = ', staff_unread_count = staff_unread_count + 1';
      } else {
        unreadSql = ', recipient_unread_count = recipient_unread_count + 1';
      }
    } else {
      unreadSql = ', buyer_unread_count = buyer_unread_count + 1';
    }

    await db.execute(
      `UPDATE property_chats SET last_message_preview = ?, updated_at = CURRENT_TIMESTAMP${unreadSql} WHERE id = ?`,
      [preview, chatId]
    );

    return result.insertId;
  },

  listMessages: async (chatId, limit = 100) => {
    const lim = Math.min(Math.max(Number(limit) || 100, 1), 300);
    const [rows] = await db.execute(
      `SELECT * FROM property_chat_messages
       WHERE chat_id = ?
       ORDER BY created_at ASC, id ASC
       LIMIT ${lim}`,
      [chatId]
    );
    return rows;
  },

  markReadForBuyer: async (chatId) => {
    await db.execute(`UPDATE property_chats SET buyer_unread_count = 0 WHERE id = ?`, [chatId]);
  },

  markReadForRecipient: async (chatId) => {
    await db.execute(`UPDATE property_chats SET recipient_unread_count = 0 WHERE id = ?`, [chatId]);
  },

  markReadForStaff: async (chatId) => {
    await db.execute(`UPDATE property_chats SET staff_unread_count = 0 WHERE id = ?`, [chatId]);
  },

  countUnreadForUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(
         CASE
           WHEN buyer_user_id = ? THEN buyer_unread_count
           WHEN recipient_user_id = ? THEN recipient_unread_count
           ELSE 0
         END
       ), 0) AS n
       FROM property_chats
       WHERE buyer_user_id = ? OR recipient_user_id = ?`,
      [userId, userId, userId, userId]
    );
    return Number(rows[0]?.n) || 0;
  },

  countUnreadForBuyer: async (buyerUserId) => {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(buyer_unread_count), 0) AS n FROM property_chats WHERE buyer_user_id = ?`,
      [buyerUserId]
    );
    return Number(rows[0]?.n) || 0;
  },

  countUnreadForRecipient: async (recipientUserId) => {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(recipient_unread_count), 0) AS n FROM property_chats WHERE recipient_user_id = ?`,
      [recipientUserId]
    );
    return Number(rows[0]?.n) || 0;
  },

  countUnreadForStaff: async () => {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(staff_unread_count), 0) AS n FROM property_chats WHERE channel = 'staff'`
    );
    return Number(rows[0]?.n) || 0;
  },
};
