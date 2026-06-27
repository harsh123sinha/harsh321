import db from '../config/database.js';
import { serviceDetailModel } from '../models/serviceDetailModel.js';

async function hasTable(tableName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return Number(rows[0]?.n) > 0;
}

async function migrateLegacyImagesToServiceDetail() {
  if (!(await hasTable('worker')) || !(await hasTable('service_detail'))) return;

  const [workers] = await db.execute(
    'SELECT id, worker_image_url, aadhar_image_url, hall_image_url FROM worker'
  );

  for (const w of workers) {
    if (w.worker_image_url) {
      const exists = await serviceDetailModel.findActiveProfileImage(w.id, 'profile_photo');
      if (!exists) {
        await db.execute(
          `INSERT INTO service_detail (worker_id, detail_type, image_url) VALUES (?, 'profile_photo', ?)`,
          [w.id, w.worker_image_url]
        );
      }
    }
    if (w.aadhar_image_url) {
      const exists = await serviceDetailModel.findActiveProfileImage(w.id, 'aadhar');
      if (!exists) {
        await db.execute(
          `INSERT INTO service_detail (worker_id, detail_type, image_url) VALUES (?, 'aadhar', ?)`,
          [w.id, w.aadhar_image_url]
        );
      }
    }
    if (w.hall_image_url) {
      const exists = await serviceDetailModel.findActiveProfileImage(w.id, 'hall_photo');
      if (!exists) {
        await db.execute(
          `INSERT INTO service_detail (worker_id, detail_type, image_url) VALUES (?, 'hall_photo', ?)`,
          [w.id, w.hall_image_url]
        );
      }
    }
  }

  if (await hasTable('worker_listings')) {
    const [legacyListings] = await db.execute('SELECT * FROM worker_listings');
    for (const l of legacyListings) {
      const [dup] = await db.execute(
        `SELECT id FROM service_detail WHERE worker_id = ? AND detail_type = 'listing' AND image_url = ? LIMIT 1`,
        [l.worker_id, l.image_url]
      );
      if (dup.length) continue;

      await db.execute(
        `INSERT INTO service_detail (
          worker_id, detail_type, image_url, title, description, rate_amount, price_type, material_type, is_active
        ) VALUES (?, 'listing', ?, ?, ?, ?, ?, ?, ?)`,
        [
          l.worker_id,
          l.image_url,
          l.title,
          l.description,
          l.rate_amount,
          l.price_type,
          l.material_type,
          l.is_active ?? 1,
        ]
      );
    }
  }

  if (workers.length) {
    console.log('✅ DB: migrated worker/service images → service_detail');
  }
}

async function hasColumn(tableName, columnName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return Number(rows[0]?.n) > 0;
}

async function ensureListingDetailColumns() {
  if (!(await hasTable('service_detail'))) return;

  const alters = [
    ['listing_kind', `ALTER TABLE service_detail ADD COLUMN listing_kind ENUM('vehicle','material') NULL AFTER material_type`],
    ['vehicle_type', `ALTER TABLE service_detail ADD COLUMN vehicle_type ENUM('car','bike') NULL AFTER listing_kind`],
    ['rental_mode', `ALTER TABLE service_detail ADD COLUMN rental_mode ENUM('self_drive','with_driver') NULL AFTER vehicle_type`],
    ['model_year', `ALTER TABLE service_detail ADD COLUMN model_year SMALLINT UNSIGNED NULL AFTER rental_mode`],
    ['company_name', `ALTER TABLE service_detail ADD COLUMN company_name VARCHAR(100) NULL AFTER model_year`],
    ['model_name', `ALTER TABLE service_detail ADD COLUMN model_name VARCHAR(100) NULL AFTER company_name`],
    ['included_km', `ALTER TABLE service_detail ADD COLUMN included_km INT UNSIGNED NULL DEFAULT 200 AFTER model_name`],
    ['extra_km_rate', `ALTER TABLE service_detail ADD COLUMN extra_km_rate DECIMAL(10,2) NULL AFTER included_km`],
    ['driver_fuel_option', `ALTER TABLE service_detail ADD COLUMN driver_fuel_option ENUM('with_fuel','without_fuel') NULL AFTER rental_mode`],
    ['fuel_cost_per_km', `ALTER TABLE service_detail ADD COLUMN fuel_cost_per_km DECIMAL(10,2) NULL AFTER extra_km_rate`],
    ['image_urls', `ALTER TABLE service_detail ADD COLUMN image_urls JSON NULL AFTER image_url`],
  ];

  for (const [col, sql] of alters) {
    if (!(await hasColumn('service_detail', col))) {
      await db.execute(sql);
      console.log(`✅ DB: service_detail.${col} added`);
    }
  }
}

export async function ensureServiceDetailSchema() {
  if (!(await hasTable('service_detail'))) {
    await db.execute(`
      CREATE TABLE service_detail (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id INT NOT NULL,
        detail_type ENUM('profile_photo','aadhar','hall_photo','listing') NOT NULL,
        image_url VARCHAR(512) NOT NULL,
        title VARCHAR(200) NULL,
        description TEXT NULL,
        rate_amount DECIMAL(12,2) NULL,
        price_type ENUM('daily','monthly','per_trip','per_unit') NULL,
        material_type VARCHAR(80) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_service_detail_worker (worker_id),
        KEY idx_service_detail_worker_type (worker_id, detail_type),
        CONSTRAINT fk_service_detail_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created service_detail table');
  }

  await ensureListingDetailColumns();
  await ensureListingPriceTypeEnum();
  await migrateLegacyImagesToServiceDetail();
}

async function ensureListingPriceTypeEnum() {
  if (!(await hasTable('service_detail'))) return;
  if (!(await hasColumn('service_detail', 'price_type'))) return;
  try {
    const [rows] = await db.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'service_detail' AND COLUMN_NAME = 'price_type'`
    );
    const colType = String(rows[0]?.COLUMN_TYPE || '');
    if (!colType.includes('per_trolley')) {
      await db.execute(
        `ALTER TABLE service_detail MODIFY COLUMN price_type ENUM('daily','monthly','per_trip','per_unit','per_trolley','per_bag') NULL`
      );
      console.log('✅ DB: service_detail.price_type extended (per_trolley, per_bag)');
    }
  } catch (e) {
    console.warn('ensureListingPriceTypeEnum:', e.message);
  }
}
