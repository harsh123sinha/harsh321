import db from '../config/database.js';

export const areaModel = {
  list: async () => {
    const [rows] = await db.execute('SELECT name FROM app_areas ORDER BY name ASC');
    return rows.map((r) => r.name).filter(Boolean);
  },

  add: async (name) => {
    const n = String(name || '').trim();
    if (!n) throw new Error('Area name is required');
    await db.execute('INSERT IGNORE INTO app_areas (name) VALUES (?)', [n]);
    return n;
  },
};

