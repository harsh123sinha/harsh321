import db from '../config/database.js';

export const workerListingModel = {
  findByWorkerId: async (workerId) => {
    const [rows] = await db.execute(
      `SELECT * FROM worker_listings WHERE worker_id = ? AND is_active = 1 ORDER BY id DESC`,
      [workerId]
    );
    return rows;
  },

  findByWorkerIds: async (workerIds) => {
    if (!workerIds?.length) return [];
    const placeholders = workerIds.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT * FROM worker_listings WHERE worker_id IN (${placeholders}) AND is_active = 1 ORDER BY id DESC`,
      workerIds
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM worker_listings WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO worker_listings (worker_id, title, description, image_url, rate_amount, price_type, material_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.worker_id,
        data.title,
        data.description || null,
        data.image_url,
        data.rate_amount,
        data.price_type || 'daily',
        data.material_type || null,
      ]
    );
    return result.insertId;
  },

  update: async (id, workerId, data) => {
    await db.execute(
      `UPDATE worker_listings SET title = ?, description = ?, image_url = ?, rate_amount = ?, price_type = ?, material_type = ?
       WHERE id = ? AND worker_id = ?`,
      [
        data.title,
        data.description || null,
        data.image_url,
        data.rate_amount,
        data.price_type || 'daily',
        data.material_type || null,
        id,
        workerId,
      ]
    );
    return true;
  },

  delete: async (id, workerId) => {
    await db.execute('DELETE FROM worker_listings WHERE id = ? AND worker_id = ?', [id, workerId]);
    return true;
  },
};
