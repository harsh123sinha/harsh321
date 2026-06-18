import db from '../config/database.js';

async function hasColumn(tableName, columnName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return Number(rows[0]?.n) > 0;
}

/**
 * Extends `properties.type` ENUM with plot_lease / plot_buy when missing.
 */
export async function ensurePropertyTypeEnum() {
  const t = 'properties';
  let rows;
  try {
    [rows] = await db.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'type'`,
      [t]
    );
  } catch (e) {
    console.warn('ensurePropertyTypeEnum:', e.message);
    return;
  }
  if (!rows.length) {
    console.warn(`Table "${t}" not found — create tables first (Backend/migrations/00_fresh_install.sql).`);
    return;
  }
  const colType = String(rows[0].COLUMN_TYPE || '');
  if (colType.includes('plot_lease') && colType.includes('plot_buy')) {
    return;
  }
  await db.execute(
    `ALTER TABLE \`${t}\` MODIFY COLUMN type ENUM('rent','buy','other','plot','plot_lease','plot_buy') NOT NULL`
  );
  console.log(`✅ DB: extended ${t}.type ENUM (plot_lease, plot_buy)`);
  const [upd] = await db.execute(
    `UPDATE \`${t}\` SET type = 'plot'
     WHERE TRIM(COALESCE(type, '')) = '' AND TRIM(COALESCE(katha, '')) <> ''`
  );
  if (upd.affectedRows > 0) {
    console.log(`✅ DB: repaired ${upd.affectedRows} row(s) with empty plot type`);
  }
}

/**
 * Adds `properties` amenity columns (and relaxes district/state) if missing.
 * Safe to run on every boot — no-op when already migrated.
 */
export async function ensurePropertySchema() {
  await ensurePropertyTypeEnum();

  const t = 'properties';

  if (!(await hasColumn(t, 'balconies'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN balconies INT NULL DEFAULT NULL AFTER katha`
    );
    console.log(`✅ DB: added ${t}.balconies`);
  }
  if (!(await hasColumn(t, 'bathrooms'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN bathrooms INT NULL DEFAULT NULL AFTER balconies`
    );
    console.log(`✅ DB: added ${t}.bathrooms`);
  }
  if (!(await hasColumn(t, 'garden'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN garden TINYINT(1) NOT NULL DEFAULT 0 AFTER bathrooms`
    );
    console.log(`✅ DB: added ${t}.garden`);
  }
  if (!(await hasColumn(t, 'car_parking'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN car_parking TINYINT(1) NOT NULL DEFAULT 0 AFTER garden`
    );
    console.log(`✅ DB: added ${t}.car_parking`);
  }
  if (!(await hasColumn(t, 'floor_no'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN floor_no VARCHAR(32) NULL DEFAULT NULL AFTER car_parking`
    );
    console.log(`✅ DB: added ${t}.floor_no`);
  }
  if (!(await hasColumn(t, 'bike_parking'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN bike_parking TINYINT(1) NOT NULL DEFAULT 0 AFTER floor_no`
    );
    console.log(`✅ DB: added ${t}.bike_parking`);
  }
  if (!(await hasColumn(t, 'shop_sqft_range'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN shop_sqft_range VARCHAR(32) NULL DEFAULT NULL AFTER bike_parking`
    );
    console.log(`✅ DB: added ${t}.shop_sqft_range`);
  }
  if (!(await hasColumn(t, 'shop_road_distance'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN shop_road_distance VARCHAR(191) NULL DEFAULT NULL AFTER shop_sqft_range`
    );
    console.log(`✅ DB: added ${t}.shop_road_distance`);
  }
  if (!(await hasColumn(t, 'shop_token_amount'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN shop_token_amount DECIMAL(15,2) NULL DEFAULT NULL AFTER shop_road_distance`
    );
    console.log(`✅ DB: added ${t}.shop_token_amount`);
  }
  if (!(await hasColumn(t, 'furnishing_status'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN furnishing_status VARCHAR(32) NULL DEFAULT NULL AFTER shop_token_amount`
    );
    console.log(`✅ DB: added ${t}.furnishing_status`);
  }

  try {
    await db.execute(`ALTER TABLE \`${t}\` MODIFY COLUMN district VARCHAR(100) NULL`);
    await db.execute(`ALTER TABLE \`${t}\` MODIFY COLUMN state VARCHAR(100) NULL`);
    const [u1] = await db.execute(
      `UPDATE \`${t}\` SET state = 'Bihar' WHERE state IS NULL OR TRIM(state) = ''`
    );
    const [u2] = await db.execute(
      `UPDATE \`${t}\` SET district = city WHERE district IS NULL OR TRIM(district) = ''`
    );
    if ((u1.affectedRows || 0) + (u2.affectedRows || 0) > 0) {
      console.log(
        `✅ DB: backfilled district/state (${(u1.affectedRows || 0) + (u2.affectedRows || 0)} row change(s))`
      );
    }
  } catch {
    /* already nullable or permission */
  }
}
