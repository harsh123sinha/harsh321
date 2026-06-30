import db from '../config/database.js';

/** MySQL 8 prepared statements reject `LIMIT ?` — use a sanitized integer in SQL. */
function sqlLimit(limit, fallback = 50, max = 500) {
  const n = Number.parseInt(String(limit), 10);
  const safe = Number.isFinite(n) && n > 0 ? n : fallback;
  return Math.min(safe, max);
}

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

/** Standard property listings (exclude enclave / apartment projects) */
const SQL_PROPERTIES_ONLY = `AND (COALESCE(p.listing_kind, 'property') = 'property')`;

/** Project listings only */
const SQL_PROJECTS_ONLY = `AND p.listing_kind = 'project'`;

const SQL_OWNER_JOIN = 'LEFT JOIN user u ON p.owner_id = u.id';

const SQL_BROKER_JOIN = `LEFT JOIN brokers br ON (
  (p.broker_id IS NOT NULL AND br.id = p.broker_id)
  OR (p.broker_id IS NULL AND LOWER(COALESCE(u.role, '')) = 'agent' AND br.user_id = u.id)
)`;

const SQL_BROKER_FIELDS = `,
  br.broker_id AS broker_public_id,
  br.name AS broker_name,
  br.photo_url AS broker_photo_url`;

const SQL_FROM_WITH_BROKER = `
  FROM properties p
  ${SQL_OWNER_JOIN}
  ${SQL_BROKER_JOIN}`;

export const propertyModel = {
  // Create new property
  create: async (propertyData) => {
    const {
      title, description, price, type, bhk, katha,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status,
      location, road_no, city, district, state, pincode, image_url, other_type, owner_id, featured,
      listing_status,
      listing_kind, project_type, developer_name, marketed_by, bhk_options, sqft_from, sqft_to,
      enclave_pdf_url,
    } = propertyData;

    const query = `
      INSERT INTO properties
      (title, description, price, type, bhk, katha,
       balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
       shop_road_distance, shop_token_amount, furnishing_status,
       location, road_no, city, district, state, pincode, image_url, other_type, owner_id, featured, listing_status,
       listing_kind, project_type, developer_name, marketed_by, bhk_options, sqft_from, sqft_to, enclave_pdf_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?, ?)
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
      listing_status || 'active',
      listing_kind || 'property',
      project_type || null,
      developer_name || null,
      marketed_by || null,
      bhk_options || null,
      sqft_from != null && sqft_from !== '' ? Number(sqft_from) : null,
      sqft_to != null && sqft_to !== '' ? Number(sqft_to) : null,
      enclave_pdf_url || null,
    ]);

    return result.insertId;
  },

  // Get all properties with owner info
  getAll: async () => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE 1=1 ${SQL_PUBLIC_ACTIVE} ${SQL_PROPERTIES_ONLY}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Get property by ID with owner info
  findById: async (id) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone, u.email as owner_email
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
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
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE p.type = ?
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROPERTIES_ONLY}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query, [type]);
    return rows;
  },

  /** Plots: legacy `plot` plus plot_lease / plot_buy, and ENUM-truncated plot rows */
  findByPlotTypes: async () => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE ${SQL_IS_PLOT_ROW}
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROPERTIES_ONLY}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Get featured properties (for home page)
  getFeatured: async (limit = 50) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE p.featured = 1
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROPERTIES_ONLY}
      ORDER BY RAND()
      LIMIT ${sqlLimit(limit, 50)}
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Featured projects only (e.g. related carousel on project detail)
  getFeaturedProjects: async (limit = 12) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE p.featured = 1
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROJECTS_ONLY}
      ORDER BY p.id DESC
      LIMIT ${sqlLimit(limit, 12)}
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  /** All active projects for home page — featured first, then newest. */
  getHomeProjects: async (limit = 12) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE 1=1
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROJECTS_ONLY}
      ORDER BY p.featured DESC, p.id DESC
      LIMIT ${sqlLimit(limit, 12)}
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  getAllProjects: async () => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE 1=1 ${SQL_PUBLIC_ACTIVE} ${SQL_PROJECTS_ONLY}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  /**
   * Pre-filter candidate rows for recommendation scoring (SQL WHERE, not full-table scan).
   * Relax level widens location, BHK, and price tolerance progressively.
   */
  findRecommendationCandidates: async (filters, options = {}) => {
    const { excludeIds = [], relaxLevel = 0, candidateLimit = 120 } = options;

    let query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE 1=1
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROPERTIES_ONLY}
    `;
    const params = [];

    const safeExclude = excludeIds.filter((id) => Number.isFinite(id) && id > 0);
    if (safeExclude.length) {
      query += ` AND p.id NOT IN (${safeExclude.map(() => '?').join(',')})`;
      params.push(...safeExclude);
    }

    const plotTypeFilter = (t) =>
      t === 'plot' || t === 'plot_lease' || t === 'plot_buy';

    const loc = String(filters.location || '').trim();
    const city = String(filters.city || '').trim();
    const type = filters.type;
    const bhk = filters.bhk;
    const minPrice = filters.minPrice;
    const maxPrice = filters.maxPrice;
    const priceSlack = [0, 0.15, 0.25, 0.35][Math.min(relaxLevel, 3)] ?? 0.35;

    const orParts = [];

    if (loc) {
      if (relaxLevel < 3) {
        const pat = `%${loc}%`;
        orParts.push('(p.location LIKE ? OR p.city LIKE ? OR p.district LIKE ?)');
        params.push(pat, pat, pat);
      } else if (city) {
        const pat = `%${city}%`;
        orParts.push('(p.city LIKE ? OR p.district LIKE ?)');
        params.push(pat, pat);
      }
    } else if (city && relaxLevel < 3) {
      const pat = `%${city}%`;
      orParts.push('(p.city LIKE ? OR p.district LIKE ?)');
      params.push(pat, pat);
    }

    if (type) {
      if (type === 'plot') {
        orParts.push(SQL_IS_PLOT_ROW);
      } else {
        orParts.push('p.type = ?');
        params.push(type);
      }
    }

    if (bhk != null && !plotTypeFilter(type)) {
      if (relaxLevel < 2) {
        orParts.push('p.bhk = ?');
        params.push(Number(bhk));
      } else {
        orParts.push('p.bhk BETWEEN ? AND ?');
        params.push(Math.max(1, Number(bhk) - 1), Number(bhk) + 1);
      }
    }

    if (filters.katha) {
      orParts.push("TRIM(COALESCE(p.katha, '')) = ?");
      params.push(filters.katha);
    }

    if (minPrice != null || maxPrice != null) {
      const minBound =
        minPrice != null ? Math.max(0, Number(minPrice) * (1 - priceSlack)) : 0;
      const maxBound =
        maxPrice != null
          ? Number(maxPrice) * (1 + priceSlack)
          : Number.MAX_SAFE_INTEGER;
      orParts.push('(p.price >= ? AND p.price <= ?)');
      params.push(minBound, maxBound);
    }

    if (filters.furnishing_status && relaxLevel >= 1) {
      orParts.push('p.furnishing_status = ?');
      params.push(filters.furnishing_status);
    }

    if (!orParts.length) {
      return [];
    }

    query += ` AND (${orParts.join(' OR ')})`;
    query += ` ORDER BY p.id DESC LIMIT ${sqlLimit(candidateLimit, 120, 200)}`;

    const [rows] = await db.execute(query, params);
    return rows;
  },

  findProjectById: async (id) => {
    const query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone, u.email as owner_email
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE p.id = ? AND p.listing_kind = 'project'
      ${SQL_PUBLIC_ACTIVE}
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  getRelatedProjects: async (excludeId, limit = 8) => {
    let query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE p.featured = 1
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROJECTS_ONLY}
    `;
    const params = [];
    if (excludeId) {
      query += ' AND p.id != ?';
      params.push(excludeId);
    }
    query += ` ORDER BY p.id DESC LIMIT ${sqlLimit(limit, 8)}`;
    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Get random properties
  getRandom: async (limit = 12, excludeId = null) => {
    let query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
    `;
    
    if (excludeId) {
      query += ` WHERE p.id != ? ${SQL_PUBLIC_ACTIVE} ${SQL_PROPERTIES_ONLY}`;
    } else {
      query += ` WHERE 1=1 ${SQL_PUBLIC_ACTIVE} ${SQL_PROPERTIES_ONLY}`;
    }
    
    query += ` ORDER BY RAND() LIMIT ${sqlLimit(limit, 12)}`;

    const params = excludeId ? [excludeId] : [];
    const [rows] = await db.execute(query, params);
    return rows;
  },

  // Search properties
  search: async (filters) => {
    let query = `
      SELECT p.*, u.name as owner_name, u.role as owner_role, u.phone_number as owner_phone
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
      WHERE 1=1
      ${SQL_PUBLIC_ACTIVE}
      ${SQL_PROPERTIES_ONLY}
    `;
    const params = [];

    if (filters.brokerId) {
      const bid = String(filters.brokerId).trim();
      if (bid) {
        query += ' AND br.broker_id = ?';
        params.push(bid);
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
      SELECT p.*, u.name as owner_name, u.phone_number as owner_phone, u.role as owner_role
      ${SQL_BROKER_FIELDS}
      ${SQL_FROM_WITH_BROKER}
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

    const enclavePdfUrl = propertyData.enclave_pdf_url;

    const query = `
      UPDATE properties
      SET title = ?, description = ?, price = ?, type = ?, bhk = ?, katha = ?,
          balconies = ?, bathrooms = ?, garden = ?, car_parking = ?, floor_no = ?,
          bike_parking = ?, shop_sqft_range = ?,
          shop_road_distance = ?, shop_token_amount = ?, furnishing_status = ?,
          location = ?, road_no = ?, city = ?, district = ?, state = ?, pincode = ?,
          image_url = ?, other_type = ?, featured = ?, owner_id = ?,
          listing_status = COALESCE(?, listing_status),
          enclave_pdf_url = COALESCE(?, enclave_pdf_url)
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
      enclavePdfUrl ?? null,
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

  /** Active public listings for XML sitemap (properties + projects). */
  getSitemapListings: async () => {
    const query = `
      SELECT p.id, p.listing_kind
      FROM properties p
      WHERE 1=1
      ${SQL_PUBLIC_ACTIVE}
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },
};
