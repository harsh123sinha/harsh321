import db from '../config/database.js';

async function hasColumn(tableName, columnName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return Number(rows[0]?.n) > 0;
}

async function hasTable(tableName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return Number(rows[0]?.n) > 0;
}

/**
 * Creates notification-related tables and optional property columns if missing.
 * Safe to run on every boot — no-op when already migrated.
 */
export async function ensureNotificationSchema() {
  if (!(await hasTable('user_fcm_tokens'))) {
    await db.execute(`
      CREATE TABLE user_fcm_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        fcm_token VARCHAR(512) NOT NULL,
        device_label VARCHAR(100) NULL,
        user_agent VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP NULL,
        UNIQUE KEY uq_fcm_token (fcm_token),
        INDEX idx_user_fcm_user (user_id),
        CONSTRAINT fk_fcm_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created user_fcm_tokens');
  }

  if (!(await hasTable('search_history'))) {
    await db.execute(`
      CREATE TABLE search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        location VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        property_type VARCHAR(32) NULL,
        bhk INT NULL,
        katha VARCHAR(100) NULL,
        other_type VARCHAR(255) NULL,
        shop_sqft_range VARCHAR(32) NULL,
        min_price DECIMAL(15,2) NULL,
        max_price DECIMAL(15,2) NULL,
        source ENUM('search_bar','chatbot','api') NOT NULL DEFAULT 'search_bar',
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_search_user_date (user_id, searched_at),
        INDEX idx_search_match (location, property_type, bhk),
        CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created search_history');
  }

  if (!(await hasTable('notifications'))) {
    await db.execute(`
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM(
          'welcome',
          'search_match',
          'daily_recommendation',
          'saved_price_drop',
          'saved_update',
          'saved_unavailable',
          'saved_verified',
          'broker_review_request',
          'worker_review_request',
          'property_chat'
        ) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        data_json JSON NULL,
        reference_key VARCHAR(191) NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        push_sent TINYINT(1) NOT NULL DEFAULT 0,
        push_sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_notification_dedup (user_id, type, reference_key),
        INDEX idx_notifications_user (user_id, is_read, created_at),
        CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created notifications');
  }

  // Keep notification type ENUM in sync on existing DBs
  if (await hasTable('notifications')) {
    try {
      const [cols] = await db.execute(
        `SELECT COLUMN_TYPE AS ct FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'type'`
      );
      const ct = String(cols[0]?.ct || '');
      const needed = ['broker_review_request', 'worker_review_request', 'property_chat'];
      if (needed.some((t) => !ct.includes(`'${t}'`))) {
        await db.execute(`
          ALTER TABLE notifications
          MODIFY COLUMN type ENUM(
            'welcome',
            'search_match',
            'daily_recommendation',
            'saved_price_drop',
            'saved_update',
            'saved_unavailable',
            'saved_verified',
            'broker_review_request',
            'worker_review_request',
            'property_chat'
          ) NOT NULL
        `);
        console.log('✅ DB: notifications.type ENUM updated');
      }
    } catch (e) {
      console.warn('⚠️ notifications.type ENUM migrate:', e.message);
    }
  }

  if (!(await hasTable('saved_properties'))) {
    await db.execute(`
      CREATE TABLE saved_properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        saved_price DECIMAL(15,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_saved_user_property (user_id, property_id),
        INDEX idx_saved_user (user_id),
        CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        CONSTRAINT fk_saved_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created saved_properties');
  }

  if (!(await hasTable('property_price_history'))) {
    await db.execute(`
      CREATE TABLE property_price_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        old_price DECIMAL(15,2) NULL,
        new_price DECIMAL(15,2) NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_price_history_property (property_id, changed_at),
        CONSTRAINT fk_price_history_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created property_price_history');
  }

  const t = 'properties';
  if (await hasTable(t)) {
    if (!(await hasColumn(t, 'is_verified'))) {
      await db.execute(
        `ALTER TABLE \`${t}\` ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER featured`
      );
      console.log(`✅ DB: added ${t}.is_verified`);
    }
    if (!(await hasColumn(t, 'listing_status'))) {
      await db.execute(
        `ALTER TABLE \`${t}\` ADD COLUMN listing_status ENUM('active','unavailable','sold') NOT NULL DEFAULT 'active' AFTER is_verified`
      );
      console.log(`✅ DB: added ${t}.listing_status`);
    }
  }
}
