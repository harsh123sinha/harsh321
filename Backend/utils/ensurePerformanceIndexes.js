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

async function hasIndex(tableName, indexName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tableName, indexName]
  );
  return Number(rows[0]?.n) > 0;
}

/** Older migration names — treat as satisfied so we do not duplicate indexes. */
const LEGACY_INDEX_ALIASES = {
  idx_properties_listing_type: 'idx_properties_reco_status_type',
  idx_properties_city: 'idx_properties_reco_city',
  idx_properties_bhk: 'idx_properties_reco_bhk',
  idx_properties_price: 'idx_properties_reco_price',
};

/**
 * Indexes aligned with API query patterns (search, listings, brokers, notifications).
 * Safe to run on every boot — skips existing indexes and missing tables/columns.
 */
const PERFORMANCE_INDEXES = [
  // --- properties (search, catalogue, recommendations, owner dashboards) ---
  {
    table: 'properties',
    name: 'idx_properties_listing_type',
    columns: 'listing_status, type',
    requiredColumns: ['listing_status', 'type'],
  },
  {
    table: 'properties',
    name: 'idx_properties_listing_featured',
    columns: 'listing_status, featured',
    requiredColumns: ['listing_status', 'featured'],
  },
  {
    table: 'properties',
    name: 'idx_properties_listing_price',
    columns: 'listing_status, price',
    requiredColumns: ['listing_status', 'price'],
  },
  {
    table: 'properties',
    name: 'idx_properties_type_bhk',
    columns: 'type, listing_status, bhk',
    requiredColumns: ['type', 'listing_status', 'bhk'],
  },
  {
    table: 'properties',
    name: 'idx_properties_owner',
    columns: 'owner_id',
    requiredColumns: ['owner_id'],
  },
  {
    table: 'properties',
    name: 'idx_properties_city',
    columns: 'city',
    requiredColumns: ['city'],
  },
  {
    table: 'properties',
    name: 'idx_properties_bhk',
    columns: 'bhk',
    requiredColumns: ['bhk'],
  },
  {
    table: 'properties',
    name: 'idx_properties_price',
    columns: 'price',
    requiredColumns: ['price'],
  },
  {
    table: 'properties',
    name: 'idx_properties_katha',
    columns: 'katha',
    requiredColumns: ['katha'],
  },
  {
    table: 'properties',
    name: 'idx_properties_shop_sqft',
    columns: 'shop_sqft_range',
    requiredColumns: ['shop_sqft_range'],
  },
  {
    table: 'properties',
    name: 'idx_properties_furnishing',
    columns: 'furnishing_status',
    requiredColumns: ['furnishing_status'],
  },
  // idx_properties_broker added by ensureBrokerSchema when broker_id column is created

  // --- user (buyer role filters in search-history jobs) ---
  {
    table: 'user',
    name: 'idx_user_role',
    columns: 'role',
    requiredColumns: ['role'],
  },

  // --- brokers ---
  {
    table: 'brokers',
    name: 'idx_brokers_user_id',
    columns: 'user_id',
    requiredColumns: ['user_id'],
  },

  // --- search_history (cron + match notifications) ---
  {
    table: 'search_history',
    name: 'idx_search_searched_at',
    columns: 'searched_at',
    requiredColumns: ['searched_at'],
  },
  {
    table: 'search_history',
    name: 'idx_search_property_type',
    columns: 'property_type',
    requiredColumns: ['property_type'],
  },

  // --- broker reviews ---
  {
    table: 'broker_customer_reviews',
    name: 'idx_reviews_customer',
    columns: 'customer_id',
    requiredColumns: ['customer_id'],
  },

  // --- saved properties ---
  {
    table: 'saved_properties',
    name: 'idx_saved_property_id',
    columns: 'property_id',
    requiredColumns: ['property_id'],
  },

  // --- notifications (inbox pagination by user + read state) ---
  {
    table: 'notifications',
    name: 'idx_notifications_user_created',
    columns: 'user_id, created_at',
    requiredColumns: ['user_id', 'created_at'],
  },
];

async function indexAlreadyPresent(table, name) {
  if (await hasIndex(table, name)) return true;
  const legacy = LEGACY_INDEX_ALIASES[name];
  if (legacy && (await hasIndex(table, legacy))) return true;
  return false;
}

async function ensureOneIndex(def) {
  if (!(await hasTable(def.table))) return null;
  if (await indexAlreadyPresent(def.table, def.name)) return null;

  for (const column of def.requiredColumns) {
    if (!(await hasColumn(def.table, column))) return null;
  }

  await db.execute(
    `CREATE INDEX \`${def.name}\` ON \`${def.table}\` (${def.columns})`
  );
  return def.name;
}

/**
 * Create missing performance indexes. Called on server boot and `npm run db:migrate`.
 */
export async function ensurePerformanceIndexes() {
  let created = 0;

  for (const def of PERFORMANCE_INDEXES) {
    try {
      const name = await ensureOneIndex(def);
      if (name) {
        console.log(`✅ DB index: ${def.table}.${name}`);
        created += 1;
      }
    } catch (e) {
      console.warn(`ensurePerformanceIndexes (${def.table}.${def.name}):`, e.message);
    }
  }

  if (created === 0) {
    console.log('✅ DB performance indexes up to date');
  } else {
    console.log(`✅ DB: added ${created} performance index(es)`);
  }
}
