import db from '../config/database.js';

const SQL_PUBLIC_ACTIVE = `AND (COALESCE(p.listing_status, 'active') = 'active')`;

export const brokerModel = {
  findByPublicId: async (brokerPublicId) => {
    const [rows] = await db.execute(
      'SELECT * FROM brokers WHERE broker_id = ? LIMIT 1',
      [String(brokerPublicId).trim()]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM brokers WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  },

  findByUserId: async (userId) => {
    const [rows] = await db.execute('SELECT * FROM brokers WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0];
  },

  generatePublicBrokerId: async () => {
    const [rows] = await db.execute('SELECT COUNT(*) AS n FROM brokers');
    const n = Number(rows[0]?.n || 0) + 1001;
    let candidate = `HTL-${n}`;
    let attempt = 0;
    while (attempt < 20) {
      const [exists] = await db.execute('SELECT id FROM brokers WHERE broker_id = ? LIMIT 1', [candidate]);
      if (!exists.length) return candidate;
      attempt += 1;
      candidate = `HTL-${n + attempt}`;
    }
    return `HTL-${Date.now().toString().slice(-6)}`;
  },

  createForAgent: async ({ broker_id, name, photo_url, area_of_work, years_of_experience, user_id }) => {
    const [result] = await db.execute(
      `INSERT INTO brokers (broker_id, name, photo_url, area_of_work, years_of_experience, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        broker_id,
        name,
        photo_url || null,
        area_of_work,
        years_of_experience,
        user_id,
      ]
    );
    return result.insertId;
  },

  searchByArea: async (area) => {
    const term = String(area || '').trim();
    if (!term) {
      const [rows] = await db.execute(
        `SELECT * FROM brokers
         ORDER BY ((COALESCE(harsh_rating_avg, 0) + COALESCE(customer_rating_avg, 0)) / 2) DESC,
                  customer_review_count DESC,
                  years_of_experience DESC`
      );
      return rows;
    }
    const pat = `%${term}%`;
    const [rows] = await db.execute(
      `SELECT * FROM brokers
       WHERE LOWER(area_of_work) LIKE LOWER(?)
       ORDER BY ((COALESCE(harsh_rating_avg, 0) + COALESCE(customer_rating_avg, 0)) / 2) DESC,
                customer_review_count DESC,
                years_of_experience DESC`,
      [pat]
    );
    return rows;
  },

  getFeatured: async (limit = 6) => {
    const [rows] = await db.execute(
      `SELECT * FROM brokers
       ORDER BY ((COALESCE(harsh_rating_avg, 0) + COALESCE(customer_rating_avg, 0)) / 2) DESC,
                customer_review_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  getPropertiesForBroker: async (brokerDbId, brokerUserId = null) => {
    const params = [brokerDbId];
    let extra = '';
    if (brokerUserId) {
      extra = ' OR p.owner_id = ?';
      params.push(brokerUserId);
    }
    const [rows] = await db.execute(
      `SELECT p.*, u.name AS owner_name, u.role AS owner_role, u.phone_number AS owner_phone,
              br.broker_id AS broker_public_id, br.name AS broker_name, br.photo_url AS broker_photo_url
       FROM properties p
       LEFT JOIN user u ON p.owner_id = u.id
       LEFT JOIN brokers br ON (
         (p.broker_id IS NOT NULL AND br.id = p.broker_id)
         OR (p.broker_id IS NULL AND LOWER(COALESCE(u.role, '')) = 'agent' AND br.user_id = u.id)
       )
       WHERE (p.broker_id = ?${extra})
       ${SQL_PUBLIC_ACTIVE}
       ORDER BY p.id DESC`,
      params
    );
    return rows;
  },

  getCustomerReviews: async (brokerDbId) => {
    const [rows] = await db.execute(
      `SELECT r.*, u.name AS customer_name
       FROM broker_customer_reviews r
       INNER JOIN user u ON u.id = r.customer_id
       WHERE r.broker_id = ?
       ORDER BY r.created_at DESC`,
      [brokerDbId]
    );
    return rows;
  },

  addInternalRating: async ({
    brokerDbId,
    propertyId,
    rating,
    staffType,
    staffId,
    customerUserId,
  }) => {
    await db.execute(
      `INSERT INTO broker_internal_ratings
       (broker_id, property_id, rating, given_by_staff_type, given_by_staff_id, customer_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [brokerDbId, propertyId || null, rating, staffType, staffId, customerUserId || null]
    );
    await brokerModel.recalculateHarshRating(brokerDbId);
    if (propertyId) {
      await db.execute('UPDATE properties SET broker_id = ? WHERE id = ?', [brokerDbId, propertyId]);
    }
  },

  addCustomerReview: async ({ brokerDbId, customerId, propertyId, rating, comment }) => {
    await db.execute(
      `INSERT INTO broker_customer_reviews (broker_id, customer_id, property_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [brokerDbId, customerId, propertyId || null, rating, comment]
    );
    await brokerModel.recalculateCustomerRating(brokerDbId);
  },

  recalculateHarshRating: async (brokerDbId) => {
    const [rows] = await db.execute(
      'SELECT AVG(rating) AS avg_rating FROM broker_internal_ratings WHERE broker_id = ?',
      [brokerDbId]
    );
    const avg = rows[0]?.avg_rating != null ? Number(rows[0].avg_rating) : null;
    await db.execute('UPDATE brokers SET harsh_rating_avg = ? WHERE id = ?', [avg, brokerDbId]);
  },

  recalculateCustomerRating: async (brokerDbId) => {
    const [rows] = await db.execute(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt
       FROM broker_customer_reviews WHERE broker_id = ?`,
      [brokerDbId]
    );
    const avg = rows[0]?.avg_rating != null ? Number(rows[0].avg_rating) : null;
    const cnt = Number(rows[0]?.cnt || 0);
    await db.execute(
      'UPDATE brokers SET customer_rating_avg = ?, customer_review_count = ? WHERE id = ?',
      [avg, cnt, brokerDbId]
    );
  },
};
