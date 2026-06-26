import db from '../config/database.js';

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

const NOTIFICATION_TYPES = [
  'welcome',
  'search_match',
  'daily_recommendation',
  'saved_price_drop',
  'saved_update',
  'saved_unavailable',
  'saved_verified',
  'broker_review_request',
];

async function ensureNotificationBrokerType() {
  if (!(await hasTable('notifications'))) return;
  try {
    const [rows] = await db.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'type'`
    );
    const colType = String(rows[0]?.COLUMN_TYPE || '');
    if (!colType.includes('broker_review_request')) {
      const enumList = NOTIFICATION_TYPES.map((t) => `'${t}'`).join(',');
      await db.execute(
        `ALTER TABLE notifications MODIFY COLUMN type ENUM(${enumList}) NOT NULL`
      );
      console.log('✅ DB: extended notifications.type (broker_review_request)');
    }
  } catch (e) {
    console.warn('ensureNotificationBrokerType:', e.message);
  }
}

const SEED_BROKERS = [
  {
    broker_id: 'HTL-1001',
    name: 'Rajesh Kumar',
    photo_url: null,
    area_of_work: 'Boring Road, Patna',
    years_of_experience: 12,
  },
  {
    broker_id: 'HTL-1002',
    name: 'Priya Sharma',
    photo_url: null,
    area_of_work: 'Kankarbagh, Patna',
    years_of_experience: 8,
  },
  {
    broker_id: 'HTL-1003',
    name: 'Amit Singh',
    photo_url: null,
    area_of_work: 'Bailey Road, Patna',
    years_of_experience: 15,
  },
  {
    broker_id: 'HTL-1004',
    name: 'Neha Verma',
    photo_url: null,
    area_of_work: 'Fraser Road, Patna',
    years_of_experience: 6,
  },
];

export async function ensureBrokerSchema() {
  if (!(await hasTable('brokers'))) {
    await db.execute(`
      CREATE TABLE brokers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        broker_id VARCHAR(32) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        photo_url VARCHAR(512) NULL,
        area_of_work VARCHAR(255) NOT NULL,
        years_of_experience INT NOT NULL DEFAULT 0,
        user_id INT NULL,
        harsh_rating_avg DECIMAL(3,2) NULL DEFAULT NULL,
        customer_rating_avg DECIMAL(3,2) NULL DEFAULT NULL,
        customer_review_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_brokers_area (area_of_work),
        CONSTRAINT fk_broker_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created brokers');
  }

  if (!(await hasTable('broker_internal_ratings'))) {
    await db.execute(`
      CREATE TABLE broker_internal_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        broker_id INT NOT NULL,
        property_id INT NULL,
        rating DECIMAL(3,2) NOT NULL,
        given_by_staff_type ENUM('admin','subadmin') NOT NULL,
        given_by_staff_id INT NOT NULL,
        customer_user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_internal_broker (broker_id),
        CONSTRAINT fk_internal_broker FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE,
        CONSTRAINT fk_internal_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
        CONSTRAINT fk_internal_customer FOREIGN KEY (customer_user_id) REFERENCES user(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created broker_internal_ratings');
  }

  if (!(await hasTable('broker_customer_reviews'))) {
    await db.execute(`
      CREATE TABLE broker_customer_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        broker_id INT NOT NULL,
        customer_id INT NOT NULL,
        property_id INT NULL,
        rating DECIMAL(3,2) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reviews_broker (broker_id, created_at),
        CONSTRAINT fk_review_broker FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE,
        CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES user(id) ON DELETE CASCADE,
        CONSTRAINT fk_review_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ DB: created broker_customer_reviews');
  }

  const pt = 'properties';
  if (!(await hasColumn(pt, 'broker_id'))) {
    await db.execute(
      `ALTER TABLE \`${pt}\` ADD COLUMN broker_id INT NULL DEFAULT NULL AFTER owner_id,
       ADD INDEX idx_properties_broker (broker_id),
       ADD CONSTRAINT fk_properties_broker FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE SET NULL`
    );
    console.log(`✅ DB: added ${pt}.broker_id`);
  }

  await ensureNotificationBrokerType();

  const [countRows] = await db.execute('SELECT COUNT(*) AS n FROM brokers');
  if (Number(countRows[0]?.n || 0) === 0) {
    for (const b of SEED_BROKERS) {
      await db.execute(
        `INSERT INTO brokers (broker_id, name, photo_url, area_of_work, years_of_experience)
         VALUES (?, ?, ?, ?, ?)`,
        [b.broker_id, b.name, b.photo_url, b.area_of_work, b.years_of_experience]
      );
    }
    console.log(`✅ DB: seeded ${SEED_BROKERS.length} sample brokers`);
  }
}
