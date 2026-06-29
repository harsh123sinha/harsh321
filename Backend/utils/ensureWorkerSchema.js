import db from '../config/database.js';
import { formatEmployeeId } from './employeeId.js';

async function hasTable(tableName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return Number(rows[0]?.n) > 0;
}

async function hasColumn(tableName, columnName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return Number(rows[0]?.n) > 0;
}

async function ensureWorkerPriceColumns() {
  if (!(await hasTable('worker'))) return;

  if (!(await hasColumn('worker', 'price_type'))) {
    await db.execute(
      `ALTER TABLE worker ADD COLUMN price_type ENUM('daily','monthly') NOT NULL DEFAULT 'daily' AFTER off_day`
    );
    console.log('✅ DB: worker.price_type added');
  }

  if (await hasColumn('worker', 'price_per_day') && !(await hasColumn('worker', 'price_amount'))) {
    await db.execute(
      `ALTER TABLE worker CHANGE COLUMN price_per_day price_amount DECIMAL(12,2) NOT NULL`
    );
    console.log('✅ DB: worker.price_per_day renamed to price_amount');
  }
}

async function ensureUserWorkerRole() {
  if (!(await hasTable('user'))) return;
  try {
    const [rows] = await db.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'role'`
    );
    const colType = String(rows[0]?.COLUMN_TYPE || '');
    if (!colType.includes('worker')) {
      await db.execute(
        `ALTER TABLE \`user\` MODIFY COLUMN role ENUM('owner', 'agent', 'buyer', 'worker') NOT NULL`
      );
      console.log('✅ DB: extended user.role (worker)');
    }
  } catch (e) {
    console.warn('ensureUserWorkerRole:', e.message);
  }
}

export async function ensureWorkerSchema() {
  await ensureUserWorkerRole();

  if (!(await hasTable('worker'))) {
    await db.execute(`
    CREATE TABLE worker (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone_number VARCHAR(15) NOT NULL,
      worker_image_url VARCHAR(512) NOT NULL,
      profession VARCHAR(120) NOT NULL,
      aadhar_image_url VARCHAR(512) NOT NULL,
      description TEXT NOT NULL,
      working_hours_per_day DECIMAL(4,1) NOT NULL,
      off_day VARCHAR(40) NOT NULL,
      price_type ENUM('daily','monthly') NOT NULL DEFAULT 'daily',
      price_amount DECIMAL(12,2) NOT NULL,
      profile_complete TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_worker_user (user_id),
      CONSTRAINT fk_worker_user FOREIGN KEY (user_id) REFERENCES \`user\`(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
    console.log('✅ DB: created worker table');
  }

  await ensureWorkerPriceColumns();
  await ensureWorkerExtendedColumns();
  await ensureEmployeeIdColumn();
  await ensureWorkerListingsTable();
  await ensureWorkerReviewSchema();
  await ensureWorkerNotificationType();
}

async function ensureEmployeeIdColumn() {
  if (!(await hasTable('worker'))) return;

  if (!(await hasColumn('worker', 'employee_id'))) {
    await db.execute(
      `ALTER TABLE worker ADD COLUMN employee_id VARCHAR(20) NULL UNIQUE AFTER user_id`
    );
    console.log('✅ DB: worker.employee_id added');
  }

  const [rows] = await db.execute('SELECT id FROM worker WHERE employee_id IS NULL OR employee_id = ""');
  for (const row of rows) {
    await db.execute('UPDATE worker SET employee_id = ? WHERE id = ?', [
      formatEmployeeId(row.id),
      row.id,
    ]);
  }
  if (rows.length) {
    console.log(`✅ DB: backfilled ${rows.length} worker employee_id value(s)`);
  }
}

async function ensureWorkerExtendedColumns() {
  if (!(await hasTable('worker'))) return;

  const alters = [
    ['profile_type', `ALTER TABLE worker ADD COLUMN profile_type VARCHAR(32) NOT NULL DEFAULT 'standard' AFTER profession`],
    ['hall_image_url', `ALTER TABLE worker ADD COLUMN hall_image_url VARCHAR(512) NULL AFTER aadhar_image_url`],
    ['area_sqft', `ALTER TABLE worker ADD COLUMN area_sqft DECIMAL(10,2) NULL AFTER hall_image_url`],
    ['outside_caterers_allowed', `ALTER TABLE worker ADD COLUMN outside_caterers_allowed TINYINT(1) NULL AFTER area_sqft`],
    ['catering_type', `ALTER TABLE worker ADD COLUMN catering_type ENUM('veg','nonveg','both') NULL AFTER outside_caterers_allowed`],
    ['hall_booking_cost', `ALTER TABLE worker ADD COLUMN hall_booking_cost DECIMAL(12,2) NULL AFTER catering_type`],
    ['veg_platter_cost', `ALTER TABLE worker ADD COLUMN veg_platter_cost DECIMAL(12,2) NULL AFTER hall_booking_cost`],
    ['nonveg_platter_cost', `ALTER TABLE worker ADD COLUMN nonveg_platter_cost DECIMAL(12,2) NULL AFTER veg_platter_cost`],
  ];

  for (const [col, sql] of alters) {
    if (!(await hasColumn('worker', col))) {
      await db.execute(sql);
      console.log(`✅ DB: worker.${col} added`);
    }
  }

  const nullables = [
    'worker_image_url',
    'aadhar_image_url',
    'working_hours_per_day',
    'off_day',
    'price_type',
    'price_amount',
  ];
  for (const col of nullables) {
    if (!(await hasColumn('worker', col))) continue;
    try {
      const [rows] = await db.execute(
        `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker' AND COLUMN_NAME = ?`,
        [col]
      );
      if (rows[0]?.IS_NULLABLE === 'NO') {
        if (col === 'working_hours_per_day') {
          await db.execute(`ALTER TABLE worker MODIFY working_hours_per_day DECIMAL(4,1) NULL`);
        } else if (col === 'price_type') {
          await db.execute(`ALTER TABLE worker MODIFY price_type ENUM('daily','monthly') NULL`);
        } else if (col === 'price_amount') {
          await db.execute(`ALTER TABLE worker MODIFY price_amount DECIMAL(12,2) NULL`);
        } else if (col === 'off_day') {
          await db.execute(`ALTER TABLE worker MODIFY off_day VARCHAR(40) NULL`);
        } else {
          await db.execute(`ALTER TABLE worker MODIFY ${col} VARCHAR(512) NULL`);
        }
      }
    } catch (e) {
      console.warn(`ensureWorkerExtendedColumns ${col}:`, e.message);
    }
  }
}

async function ensureWorkerListingsTable() {
  if (await hasTable('worker_listings')) return;
  await db.execute(`
    CREATE TABLE worker_listings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      worker_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NULL,
      image_url VARCHAR(512) NOT NULL,
      rate_amount DECIMAL(12,2) NOT NULL,
      price_type ENUM('daily','monthly','per_trip','per_unit') NOT NULL DEFAULT 'daily',
      material_type VARCHAR(80) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_worker_listings_worker (worker_id),
      CONSTRAINT fk_worker_listings_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✅ DB: created worker_listings table');
}

async function ensureWorkerReviewSchema() {
  if (!(await hasTable('worker'))) return;

  if (!(await hasColumn('worker', 'harsh_rating_avg'))) {
    await db.execute(`ALTER TABLE worker ADD COLUMN harsh_rating_avg DECIMAL(3,2) NULL AFTER profile_complete`);
    console.log('✅ DB: worker.harsh_rating_avg added');
  }
  if (!(await hasColumn('worker', 'review_count'))) {
    await db.execute(`ALTER TABLE worker ADD COLUMN review_count INT NOT NULL DEFAULT 0 AFTER harsh_rating_avg`);
    console.log('✅ DB: worker.review_count added');
  }
  if (!(await hasColumn('worker', 'customer_rating_avg'))) {
    await db.execute(`ALTER TABLE worker ADD COLUMN customer_rating_avg DECIMAL(3,2) NULL AFTER review_count`);
    console.log('✅ DB: worker.customer_rating_avg added');
  }
  if (!(await hasColumn('worker', 'customer_review_count'))) {
    await db.execute(
      `ALTER TABLE worker ADD COLUMN customer_review_count INT NOT NULL DEFAULT 0 AFTER customer_rating_avg`
    );
    console.log('✅ DB: worker.customer_review_count added');
  }

  if (!(await hasTable('worker_internal_reviews'))) {
    await db.execute(`
    CREATE TABLE worker_internal_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      worker_id INT NOT NULL,
      rating DECIMAL(3,2) NOT NULL,
      comment TEXT NULL,
      given_by_staff_type ENUM('admin','subadmin') NOT NULL,
      given_by_staff_id INT NOT NULL,
      customer_user_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_worker_reviews_worker (worker_id, created_at),
      CONSTRAINT fk_worker_reviews_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
    console.log('✅ DB: created worker_internal_reviews table');
  } else {
    if (!(await hasColumn('worker_internal_reviews', 'customer_user_id'))) {
      await db.execute(
        `ALTER TABLE worker_internal_reviews ADD COLUMN customer_user_id INT NULL AFTER given_by_staff_id`
      );
      console.log('✅ DB: worker_internal_reviews.customer_user_id added');
    }
    try {
      await db.execute(`ALTER TABLE worker_internal_reviews MODIFY comment TEXT NULL`);
    } catch (e) {
      console.warn('ensureWorkerReviewSchema comment nullable:', e.message);
    }
  }

  if (await hasTable('worker_customer_reviews')) return;

  await db.execute(`
    CREATE TABLE worker_customer_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      worker_id INT NOT NULL,
      customer_id INT NOT NULL,
      rating DECIMAL(3,2) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_worker_customer_reviews_worker (worker_id, created_at),
      CONSTRAINT fk_worker_customer_reviews_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE,
      CONSTRAINT fk_worker_customer_reviews_customer FOREIGN KEY (customer_id) REFERENCES \`user\`(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✅ DB: created worker_customer_reviews table');
}

const WORKER_NOTIFICATION_TYPES = [
  'welcome',
  'search_match',
  'daily_recommendation',
  'saved_price_drop',
  'saved_update',
  'saved_unavailable',
  'saved_verified',
  'broker_review_request',
  'worker_review_request',
];

async function ensureWorkerNotificationType() {
  if (!(await hasTable('notifications'))) return;
  try {
    const [rows] = await db.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'type'`
    );
    const colType = String(rows[0]?.COLUMN_TYPE || '');
    if (!colType.includes('worker_review_request')) {
      const enumList = WORKER_NOTIFICATION_TYPES.map((t) => `'${t}'`).join(',');
      await db.execute(`ALTER TABLE notifications MODIFY COLUMN type ENUM(${enumList}) NOT NULL`);
      console.log('✅ DB: extended notifications.type (worker_review_request)');
    }
  } catch (e) {
    console.warn('ensureWorkerNotificationType:', e.message);
  }
}
