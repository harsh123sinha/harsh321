import db from '../config/database.js';

export async function ensureAreasSchema() {
  // Simple, global area list (used by frontend dropdowns).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_areas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

