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

export async function ensureMissionSchema() {
  if (!(await hasTable('mission_registrations'))) {
    await db.execute(`
      CREATE TABLE mission_registrations (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(191) NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        email VARCHAR(191) NULL DEFAULT NULL,
        group_mode ENUM('match','group') NOT NULL,
        group_code VARCHAR(32) NULL DEFAULT NULL,
        area VARCHAR(191) NULL DEFAULT NULL,
        pincode VARCHAR(6) NULL DEFAULT NULL,
        bhk VARCHAR(8) NOT NULL,
        floor_pref VARCHAR(32) NULL DEFAULT NULL,
        family_size VARCHAR(32) NULL DEFAULT NULL,
        funds_range VARCHAR(32) NOT NULL,
        timeline VARCHAR(32) NULL DEFAULT NULL,
        consent TINYINT(1) NOT NULL DEFAULT 0,
        status ENUM('new','contacted','matched','closed') NOT NULL DEFAULT 'new',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_mission_reg_mobile (mobile),
        KEY idx_mission_reg_status (status),
        KEY idx_mission_reg_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ DB: created mission_registrations');
  }

  if (!(await hasTable('staff_alerts'))) {
    await db.execute(`
      CREATE TABLE staff_alerts (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        category ENUM('worker','owner','agent','buyer','mission','property') NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NULL,
        link_path VARCHAR(255) NULL DEFAULT NULL,
        reference_id INT UNSIGNED NULL DEFAULT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_staff_alerts_unread (is_read, created_at),
        KEY idx_staff_alerts_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ DB: created staff_alerts');
  }

  const t = 'properties';
  if (!(await hasColumn(t, 'listed_by_staff'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN listed_by_staff ENUM('admin','subadmin') NULL DEFAULT NULL AFTER listing_review_reason`
    );
    console.log(`✅ DB: added ${t}.listed_by_staff`);
  }
}
