import db from '../config/database.js';

export const workerCustomerReviewModel = {
  findByWorkerId: async (workerId) => {
    const [rows] = await db.execute(
      `SELECT r.*, u.name AS customer_name
       FROM worker_customer_reviews r
       INNER JOIN \`user\` u ON u.id = r.customer_id
       WHERE r.worker_id = ?
       ORDER BY r.created_at DESC`,
      [workerId]
    );
    return rows.map(mapCustomerReviewRow);
  },

  findByWorkerIds: async (workerIds) => {
    if (!workerIds?.length) return [];
    const placeholders = workerIds.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT r.*, u.name AS customer_name
       FROM worker_customer_reviews r
       INNER JOIN \`user\` u ON u.id = r.customer_id
       WHERE r.worker_id IN (${placeholders})
       ORDER BY r.created_at DESC`,
      workerIds
    );
    return rows.map(mapCustomerReviewRow);
  },

  addReview: async ({ workerId, customerId, rating, comment }) => {
    await db.execute(
      `INSERT INTO worker_customer_reviews (worker_id, customer_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [workerId, customerId, rating, comment]
    );
    await workerCustomerReviewModel.recalculateCustomerRating(workerId);
  },

  recalculateCustomerRating: async (workerId) => {
    const [rows] = await db.execute(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt
       FROM worker_customer_reviews WHERE worker_id = ?`,
      [workerId]
    );
    const avg = rows[0]?.avg_rating != null ? Number(rows[0].avg_rating) : null;
    const cnt = Number(rows[0]?.cnt || 0);
    await db.execute(
      'UPDATE worker SET customer_rating_avg = ?, customer_review_count = ? WHERE id = ?',
      [avg, cnt, workerId]
    );
    return { avg, cnt };
  },
};

function mapCustomerReviewRow(row) {
  return {
    id: row.id,
    worker_id: row.worker_id,
    customer_id: row.customer_id,
    customer_name: row.customer_name,
    rating: Number(row.rating),
    comment: row.comment,
    created_at: row.created_at,
  };
}
