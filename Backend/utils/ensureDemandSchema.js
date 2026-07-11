import db from '../config/database.js';

async function hasTable(tableName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return Number(rows[0]?.n) > 0;
}

async function ensureStaffAlertDemandCategory() {
  try {
    const [cols] = await db.execute(
      `SELECT COLUMN_TYPE AS ct FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff_alerts' AND COLUMN_NAME = 'category'`
    );
    const ct = String(cols[0]?.ct || '');
    if (ct && !ct.includes("'demand'")) {
      await db.execute(
        `ALTER TABLE staff_alerts
         MODIFY COLUMN category ENUM('worker','owner','agent','buyer','mission','property','demand') NOT NULL`
      );
      console.log('✅ DB: staff_alerts.category includes demand');
    }
  } catch (e) {
    console.warn('⚠️ staff_alerts demand category:', e.message);
  }
}

export async function ensureDemandSchema() {
  if (!(await hasTable('user_demands'))) {
    await db.execute(`
      CREATE TABLE user_demands (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        contact_phone VARCHAR(15) NOT NULL,
        contact_name VARCHAR(191) NULL DEFAULT NULL,
        category VARCHAR(32) NOT NULL,
        listing_type VARCHAR(32) NULL DEFAULT NULL,
        requirements TEXT NULL,
        location VARCHAR(191) NULL DEFAULT NULL,
        city VARCHAR(64) NULL DEFAULT NULL,
        bhk VARCHAR(16) NULL DEFAULT NULL,
        floor_pref VARCHAR(32) NULL DEFAULT NULL,
        facing VARCHAR(16) NULL DEFAULT NULL,
        furnishing VARCHAR(32) NULL DEFAULT NULL,
        shop_sqft_range VARCHAR(32) NULL DEFAULT NULL,
        katha VARCHAR(32) NULL DEFAULT NULL,
        budget_min DECIMAL(14,2) NULL DEFAULT NULL,
        budget_max DECIMAL(14,2) NULL DEFAULT NULL,
        status ENUM('new','contacted','matched','closed') NOT NULL DEFAULT 'new',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_user_demands_phone (contact_phone),
        KEY idx_user_demands_status (status),
        KEY idx_user_demands_category (category),
        KEY idx_user_demands_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ DB: created user_demands');
  }

  await ensureStaffAlertDemandCategory();
}
