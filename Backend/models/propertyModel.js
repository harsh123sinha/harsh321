import db from '../config/database.js';

/**
 * Plot listings: explicit types, plus rows where an older DB used
 * `ENUM('rent','buy','other','plot')` without `plot_lease` / `plot_buy`.
 * In non-strict SQL mode MySQL can store those inserts as `type = ''` while
 * `katha` remains set — they still appear in "My properties" but were excluded
 * from plot listings. See `Backend/migrations/001_extend_property_type_enum.sql`.
 */
const SQL_IS_PLOT_ROW = `(
  p.type IN ('plot', 'plot_lease', 'plot_buy')
  OR (
    TRIM(COALESCE(p.type, '')) = ''
    AND TRIM(COALESCE(p.katha, '')) <> ''
  )
)`;

/** Public catalogue: only approved active listings */
const SQL_PUBLIC_ACTIVE = `AND (COALESCE(p.listing_status, 'active') = 'active')`;

export const propertyModel = {
  // Create new property
  create: async (propertyData) => {
    const {
      title, description, price, type, bhk, katha,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status,
      location, road_no, city, district, state, pincode, image_url, other_type, owner_id, featured,
      listing_status
    } = propertyData;

    const query = `
      INSERT INTO properties
      (title, description, price, type, bhk, katha,
       balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
       shop_road_distance, shop_token_amount, furnishing_status,
       location, road_no, city, district, state, pincode, image_url, other_type, owner_id, featured, listing_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      title, description, price, type, bhk || null, katha || null,
      balconies ?? null,
      bathrooms ?? null,
      garden ? 1 : 0,
      car_parking ? 1 : 0,
      floor_no || null,
      bike_parking ? 1 : 0,
      shop_sqft_range || null,
      shop_road_distance || null,
      shop_token_amount != null && String(shop_token_amount).trim() !== '' && Number.isFinite(Number(shop_token_amount))
        ? Number(shop_token_amount)
        : null,
      furnishing_status || null,
      location,
      road_no ?? null,
      city, district, state, pincode || null, image_url,
      other_type || null, owner_id, featured || 0,
      listing_status || 'active'
    ]);

    return result.insertId;
  },

  // Get all properties with owner info
  getAll: async () => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE 1=1 ${SQL_PUBLIC_ACTIVE}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Get property by ID with owner info
  findById: async (id) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone, u.email as owner_email
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE p.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  // Get properties by owner ID
  findByOwnerId: async (ownerId) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE p.owner_id = ?
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query, [ownerId]);
    return rows;
  },

  // Get properties by type
  findByType: async (type) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE p.type = ?
      ${SQL_PUBLIC_ACTIVE}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query, [type]);
    return rows;
  },

  /** Plots: legacy `plot` plus plot_lease / plot_buy, and ENUM-truncated plot rows */
  findByPlotTypes: async () => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE ${SQL_IS_PLOT_ROW}
      ${SQL_PUBLIC_ACTIVE}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Get featured properties (for home page)
  getFeatured: async (limit = 50) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE p.featured = 1
      ${SQL_PUBLIC_ACTIVE}
      ORDER BY RAND()
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [limit]);
    return rows;
  },

  // Get random properties
  getRandom: async (limit = 12, excludeId = null) => {
    let query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
    `;
    
    if (excludeId) {
      query += ` WHERE p.id != ? ${SQL_PUBLIC_ACTIVE}`;
    } else {
      query += ` WHERE 1=1 ${SQL_PUBLIC_ACTIVE}`;
    }
    
    query += ` ORDER BY RAND() LIMIT ?`;
    
    const params = excludeId ? [excludeId, limit] : [limit];
    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Search properties
  search: async (filters) => {
    let query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE 1=1
      ${SQL_PUBLIC_ACTIVE}
    `;
    const params = [];

    if (filters.location) {
      const loc = String(filters.location).trim();
      if (loc) {
        const pat = `%${loc}%`;
        query += ' AND (p.location LIKE ? OR p.city LIKE ? OR p.district LIKE ?)';
        params.push(pat, pat, pat);
      }
    }

    const plotTypeFilter = (t) =>
      t === 'plot' || t === 'plot_lease' || t === 'plot_buy';

    if (filters.type) {
      if (filters.type === 'plot') {
        query += ` AND ${SQL_IS_PLOT_ROW}`;
      } else {
        query += ' AND p.type = ?';
        params.push(filters.type);
      }
    }

    if (filters.bhk && !plotTypeFilter(filters.type)) {
      query += ' AND p.bhk = ?';
      params.push(filters.bhk);
    }

    if (filters.katha) {
      const k = String(filters.katha).trim();
      if (k) {
        query += " AND TRIM(COALESCE(p.katha, '')) = ?";
        params.push(k);
      }
    }

    if (filters.other_type) {
      query += ' AND p.other_type LIKE ?';
      params.push(`%${filters.other_type}%`);
    }

    if (filters.shop_sqft_range) {
      const sr = String(filters.shop_sqft_range).trim();
      if (sr) {
        query += ' AND p.shop_sqft_range = ?';
        params.push(sr);
      }
    }

    if (filters.city) {
      query += ' AND p.city LIKE ?';
      params.push(`%${filters.city}%`);
    }

    if (filters.minPrice) {
      query += ' AND p.price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ' AND p.price <= ?';
      params.push(filters.maxPrice);
    }

    query += ' ORDER BY p.id DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Admin search (includes title/description)
  adminSearch: async (filters) => {
    let query = `
      SELECT p.*, u.name as owner_name, u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN user u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.location LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const plotTypeFilter = (t) =>
      t === 'plot' || t === 'plot_lease' || t === 'plot_buy';

    if (filters.type) {
      if (filters.type === 'plot') {
        query += ` AND ${SQL_IS_PLOT_ROW}`;
      } else {
        query += ' AND p.type = ?';
        params.push(filters.type);
      }
    }

    if (filters.bhk && !plotTypeFilter(filters.type)) {
      query += ' AND p.bhk = ?';
      params.push(filters.bhk);
    }

    if (filters.katha) {
      const k = String(filters.katha).trim();
      if (k) {
        query += " AND TRIM(COALESCE(p.katha, '')) = ?";
        params.push(k);
      }
    }

    if (filters.other_type) {
      query += ' AND p.other_type LIKE ?';
      params.push(`%${filters.other_type}%`);
    }

    if (filters.shop_sqft_range) {
      const sr = String(filters.shop_sqft_range).trim();
      if (sr) {
        query += ' AND p.shop_sqft_range = ?';
        params.push(sr);
      }
    }

    if (filters.location) {
      const loc = String(filters.location).trim();
      if (loc) {
        const pat = `%${loc}%`;
        query += ' AND (p.location LIKE ? OR p.city LIKE ? OR p.district LIKE ?)';
        params.push(pat, pat, pat);
      }
    }

    query += ' ORDER BY p.id DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Update property
  update: async (id, propertyData) => {
    const {
      title, description, price, type, bhk, katha,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status,
      location, road_no, city, district, state, pincode, image_url, other_type, featured, owner_id,
      listing_status
    } = propertyData;

    const query = `
      UPDATE properties
      SET title = ?, description = ?, price = ?, type = ?, bhk = ?, katha = ?,
          balconies = ?, bathrooms = ?, garden = ?, car_parking = ?, floor_no = ?,
          bike_parking = ?, shop_sqft_range = ?,
          shop_road_distance = ?, shop_token_amount = ?, furnishing_status = ?,
          location = ?, road_no = ?, city = ?, district = ?, state = ?, pincode = ?,
          image_url = ?, other_type = ?, featured = ?, owner_id = ?,
          listing_status = COALESCE(?, listing_status)
      WHERE id = ?
    `;

    await db.execute(query, [
      title, description, price, type, bhk || null, katha || null,
      balconies ?? null,
      bathrooms ?? null,
      garden ? 1 : 0,
      car_parking ? 1 : 0,
      floor_no || null,
      bike_parking ? 1 : 0,
      shop_sqft_range || null,
      shop_road_distance || null,
      shop_token_amount != null && String(shop_token_amount).trim() !== '' && Number.isFinite(Number(shop_token_amount))
        ? Number(shop_token_amount)
        : null,
      furnishing_status || null,
      location,
      road_no ?? null,
      city, district, state, pincode || null, image_url,
      other_type || null, featured || 0, owner_id,
      listing_status || null,
      id
    ]);

    return true;
  },

  setListingStatus: async (id, listingStatus) => {
    await db.execute('UPDATE properties SET listing_status = ? WHERE id = ?', [listingStatus, id]);
    return true;
  },

  // Toggle featured status
  toggleFeatured: async (id, featured) => {
    const query = 'UPDATE properties SET featured = ? WHERE id = ?';
    await db.execute(query, [featured ? 1 : 0, id]);
    return true;
  },

  // Delete property
  delete: async (id) => {
    const query = 'DELETE FROM properties WHERE id = ?';
    await db.execute(query, [id]);
    return true;
  },

  // Get property count
  getCount: async () => {
    const query = 'SELECT COUNT(*) as count FROM properties';
    const [rows] = await db.execute(query);
    return rows[0].count;
  },
};
