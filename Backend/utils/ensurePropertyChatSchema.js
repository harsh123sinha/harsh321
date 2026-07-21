import db from '../config/database.js';

async function hasTable(tableName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return Number(rows[0]?.n) > 0;
}

async function ensureStaffAlertChatCategory() {
  try {
    const [cols] = await db.execute(
      `SELECT COLUMN_TYPE AS ct FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff_alerts' AND COLUMN_NAME = 'category'`
    );
    const ct = String(cols[0]?.ct || '');
    if (ct && !ct.includes("'chat'")) {
      await db.execute(
        `ALTER TABLE staff_alerts
         MODIFY COLUMN category ENUM('worker','owner','agent','buyer','mission','property','demand','chat') NOT NULL`
      );
      console.log('✅ DB: staff_alerts.category includes chat');
    }
  } catch (e) {
    console.warn('⚠️ staff_alerts chat category:', e.message);
  }
}

export async function ensurePropertyChatSchema() {
  if (!(await hasTable('property_chats'))) {
    await db.execute(`
      CREATE TABLE property_chats (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        property_id INT UNSIGNED NOT NULL,
        buyer_user_id INT UNSIGNED NOT NULL,
        channel ENUM('owner','agent','staff') NOT NULL,
        recipient_user_id INT UNSIGNED NULL DEFAULT NULL,
        listed_by_staff ENUM('admin','subadmin') NULL DEFAULT NULL,
        last_message_preview VARCHAR(500) NULL DEFAULT NULL,
        buyer_unread_count INT UNSIGNED NOT NULL DEFAULT 0,
        recipient_unread_count INT UNSIGNED NOT NULL DEFAULT 0,
        staff_unread_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_property_chat_buyer (property_id, buyer_user_id),
        KEY idx_property_chats_buyer (buyer_user_id),
        KEY idx_property_chats_recipient (recipient_user_id),
        KEY idx_property_chats_staff (listed_by_staff),
        KEY idx_property_chats_updated (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ DB: created property_chats');
  }

  if (!(await hasTable('property_chat_messages'))) {
    await db.execute(`
      CREATE TABLE property_chat_messages (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        chat_id INT UNSIGNED NOT NULL,
        sender_kind ENUM('buyer','user','staff') NOT NULL,
        sender_user_id INT UNSIGNED NULL DEFAULT NULL,
        sender_staff_id INT UNSIGNED NULL DEFAULT NULL,
        sender_staff_role ENUM('admin','subadmin') NULL DEFAULT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_chat_messages_chat (chat_id, created_at),
        CONSTRAINT fk_chat_messages_chat FOREIGN KEY (chat_id) REFERENCES property_chats(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ DB: created property_chat_messages');
  }

  await ensureStaffAlertChatCategory();
}
