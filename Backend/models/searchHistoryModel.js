import db from '../config/database.js';

export const searchHistoryModel = {
  insert: async (row) => {
    const {
      userId,
      location,
      city,
      propertyType,
      bhk,
      katha,
      otherType,
      shopSqftRange,
      minPrice,
      maxPrice,
      source = 'search_bar',
    } = row;

    const [result] = await db.execute(
      `INSERT INTO search_history
       (user_id, location, city, property_type, bhk, katha, other_type, shop_sqft_range, min_price, max_price, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        location || null,
        city || null,
        propertyType || null,
        bhk != null && bhk !== '' ? Number(bhk) : null,
        katha || null,
        otherType || null,
        shopSqftRange || null,
        minPrice != null && minPrice !== '' ? Number(minPrice) : null,
        maxPrice != null && maxPrice !== '' ? Number(maxPrice) : null,
        source,
      ]
    );
    const [rows] = await db.execute('SELECT * FROM search_history WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  findMatchingForProperty: async (property, { daysBack = 90 } = {}) => {
    const plotTypes = ['plot', 'plot_lease', 'plot_buy'];
    const isPlot =
      plotTypes.includes(property.type) ||
      (String(property.type || '').trim() === '' && String(property.katha || '').trim() !== '');

    const params = [daysBack];
    let query = `
      SELECT sh.*, u.role AS user_role
      FROM search_history sh
      INNER JOIN user u ON u.id = sh.user_id
      WHERE u.role = 'buyer'
        AND sh.searched_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    if (isPlot) {
      query += ` AND (sh.property_type IN ('plot','plot_lease','plot_buy') OR sh.property_type IS NULL)`;
    } else if (property.type) {
      query += ' AND (sh.property_type = ? OR sh.property_type IS NULL)';
      params.push(property.type);
    }

    if (property.bhk) {
      query += ' AND (sh.bhk = ? OR sh.bhk IS NULL)';
      params.push(property.bhk);
    }

    if (property.other_type) {
      const ot = String(property.other_type).trim();
      if (ot) {
        query += ' AND (sh.other_type LIKE ? OR sh.other_type IS NULL)';
        params.push(`%${ot}%`);
      }
    }

    if (property.shop_sqft_range) {
      query += ' AND (sh.shop_sqft_range = ? OR sh.shop_sqft_range IS NULL)';
      params.push(property.shop_sqft_range);
    }

    if (property.katha) {
      query += ' AND (TRIM(COALESCE(sh.katha, "")) = ? OR sh.katha IS NULL)';
      params.push(String(property.katha).trim());
    }

    const loc = String(property.location || '').trim();
    const city = String(property.city || '').trim();
    if (loc || city) {
      query += ` AND (
        sh.location IS NULL OR sh.location = '' OR
        ? LIKE CONCAT('%', sh.location, '%') OR
        sh.location LIKE ? OR
        (sh.city IS NOT NULL AND (sh.city LIKE ? OR ? LIKE CONCAT('%', sh.city, '%')))
      )`;
      const locPat = loc ? `%${loc}%` : `%${city}%`;
      params.push(loc || city, locPat, city ? `%${city}%` : locPat, city || loc);
    }

    const price = Number(property.price);
    if (Number.isFinite(price)) {
      query += ` AND (
        (sh.min_price IS NULL AND sh.max_price IS NULL) OR
        (sh.min_price IS NULL OR ? >= sh.min_price) AND
        (sh.max_price IS NULL OR ? <= sh.max_price * 1.15)
      )`;
      params.push(price, price);
    }

    query += ' ORDER BY sh.searched_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  findRecentByUser: async (userId, daysBack = 30) => {
    const [rows] = await db.execute(
      `SELECT * FROM search_history
       WHERE user_id = ? AND searched_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY searched_at DESC`,
      [userId, daysBack]
    );
    return rows;
  },

  findBuyerIdsWithRecentSearches: async (daysBack = 30) => {
    const [rows] = await db.execute(
      `SELECT DISTINCT sh.user_id
       FROM search_history sh
       INNER JOIN user u ON u.id = sh.user_id
       WHERE u.role = 'buyer' AND sh.searched_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysBack]
    );
    return rows.map((r) => r.user_id);
  },
};
