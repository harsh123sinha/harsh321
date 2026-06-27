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
 * Project listings (enclave / apartment) share the properties table with listing_kind = 'project'.
 */
export async function ensureProjectSchema() {
  const t = 'properties';

  if (!(await hasColumn(t, 'listing_kind'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN listing_kind ENUM('property','project') NOT NULL DEFAULT 'property' AFTER listing_status`
    );
    console.log(`✅ DB: added ${t}.listing_kind`);
  }

  if (!(await hasColumn(t, 'project_type'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN project_type ENUM('enclave','apartment') NULL DEFAULT NULL AFTER listing_kind`
    );
    console.log(`✅ DB: added ${t}.project_type`);
  }

  if (!(await hasColumn(t, 'developer_name'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN developer_name VARCHAR(255) NULL DEFAULT NULL AFTER project_type`
    );
    console.log(`✅ DB: added ${t}.developer_name`);
  }

  if (!(await hasColumn(t, 'marketed_by'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN marketed_by VARCHAR(255) NULL DEFAULT NULL AFTER developer_name`
    );
    console.log(`✅ DB: added ${t}.marketed_by`);
  }

  if (!(await hasColumn(t, 'bhk_options'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN bhk_options VARCHAR(128) NULL DEFAULT NULL AFTER marketed_by`
    );
    console.log(`✅ DB: added ${t}.bhk_options`);
  }

  if (!(await hasColumn(t, 'sqft_from'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN sqft_from INT UNSIGNED NULL DEFAULT NULL AFTER bhk_options`
    );
    console.log(`✅ DB: added ${t}.sqft_from`);
  }

  if (!(await hasColumn(t, 'sqft_to'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN sqft_to INT UNSIGNED NULL DEFAULT NULL AFTER sqft_from`
    );
    console.log(`✅ DB: added ${t}.sqft_to`);
  }

  if (!(await hasColumn(t, 'enclave_pdf_url'))) {
    await db.execute(
      `ALTER TABLE \`${t}\` ADD COLUMN enclave_pdf_url VARCHAR(512) NULL DEFAULT NULL AFTER sqft_to`
    );
    console.log(`✅ DB: added ${t}.enclave_pdf_url`);
  }
}
