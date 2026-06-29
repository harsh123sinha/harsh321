import db from '../config/database.js';

export const workerReviewModel = {
  findByWorkerId: async (workerId) => {
    const [rows] = await db.execute(
      `SELECT r.*, a.name AS admin_name, s.name AS subadmin_name
       FROM worker_internal_reviews r
       LEFT JOIN admins a ON r.given_by_staff_type = 'admin' AND a.id = r.given_by_staff_id
       LEFT JOIN sub_admins s ON r.given_by_staff_type = 'subadmin' AND s.id = r.given_by_staff_id
       WHERE r.worker_id = ?
       ORDER BY r.created_at DESC`,
      [workerId]
    );
    return rows.map(mapReviewRow);
  },

  findByWorkerIds: async (workerIds) => {
    if (!workerIds?.length) return [];
    const placeholders = workerIds.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT r.*, a.name AS admin_name, s.name AS subadmin_name
       FROM worker_internal_reviews r
       LEFT JOIN admins a ON r.given_by_staff_type = 'admin' AND a.id = r.given_by_staff_id
       LEFT JOIN sub_admins s ON r.given_by_staff_type = 'subadmin' AND s.id = r.given_by_staff_id
       WHERE r.worker_id IN (${placeholders})
       ORDER BY r.created_at DESC`,
      workerIds
    );
    return rows.map(mapReviewRow);
  },

  addInternalRating: async ({ workerId, rating, staffType, staffId, customerUserId }) => {
    const [result] = await db.execute(
      `INSERT INTO worker_internal_reviews
       (worker_id, rating, given_by_staff_type, given_by_staff_id, customer_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [workerId, rating, staffType, staffId, customerUserId || null]
    );
    await workerReviewModel.recalculateRating(workerId);
    return result.insertId;
  },

  recalculateRating: async (workerId) => {
    const [rows] = await db.execute(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM worker_internal_reviews WHERE worker_id = ?`,
      [workerId]
    );
    const avg = rows[0]?.avg_rating != null ? Number(rows[0].avg_rating) : null;
    const cnt = Number(rows[0]?.cnt || 0);
    await db.execute('UPDATE worker SET harsh_rating_avg = ?, review_count = ? WHERE id = ?', [
      avg,
      cnt,
      workerId,
    ]);
    return { avg, cnt };
  },
};

function mapReviewRow(row) {
  const staffName =
    row.given_by_staff_type === 'admin' ? row.admin_name : row.subadmin_name;
  return {
    id: row.id,
    worker_id: row.worker_id,
    rating: Number(row.rating),
    comment: row.comment,
    given_by_staff_type: row.given_by_staff_type,
    given_by_staff_id: row.given_by_staff_id,
    staff_name: staffName || row.given_by_staff_type,
    created_at: row.created_at,
  };
}
