import db from '../config/database.js';

/** Service image types — stored separately from property images */
export const SERVICE_DETAIL_TYPES = ['profile_photo', 'aadhar', 'hall_photo', 'listing'];

function parseImageUrls(row) {
  if (row?.image_urls) {
    try {
      const parsed = typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls;
      if (Array.isArray(parsed) && parsed.length) return parsed.filter(Boolean);
    } catch {
      /* fall through */
    }
  }
  return row?.image_url ? [row.image_url] : [];
}

function mapListingRow(row) {
  if (!row) return null;
  const image_urls = parseImageUrls(row);
  return {
    id: row.id,
    worker_id: row.worker_id,
    title: row.title,
    description: row.description,
    image_url: image_urls[0] || row.image_url,
    image_urls,
    rate_amount: row.rate_amount,
    price_type: row.price_type,
    material_type: row.material_type,
    listing_kind: row.listing_kind,
    vehicle_type: row.vehicle_type,
    rental_mode: row.rental_mode,
    driver_fuel_option: row.driver_fuel_option,
    model_year: row.model_year,
    company_name: row.company_name,
    model_name: row.model_name,
    included_km: row.included_km,
    extra_km_rate: row.extra_km_rate,
    fuel_cost_per_km: row.fuel_cost_per_km,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildVehicleTitle(data) {
  const company = String(data.company_name || '').trim();
  const model = String(data.model_name || '').trim();
  const year = data.model_year ? ` (${data.model_year})` : '';
  const parts = [company, model].filter(Boolean).join(' ');
  return parts ? `${parts}${year}` : String(data.title || '').trim();
}

export const serviceDetailModel = {
  findByWorkerId: async (workerId, { activeOnly = true } = {}) => {
    const sql = activeOnly
      ? 'SELECT * FROM service_detail WHERE worker_id = ? AND is_active = 1 ORDER BY detail_type, id DESC'
      : 'SELECT * FROM service_detail WHERE worker_id = ? ORDER BY detail_type, id DESC';
    const [rows] = await db.execute(sql, [workerId]);
    return rows;
  },

  findByWorkerIds: async (workerIds, detailType = null) => {
    if (!workerIds?.length) return [];
    const placeholders = workerIds.map(() => '?').join(',');
    let sql = `SELECT * FROM service_detail WHERE worker_id IN (${placeholders}) AND is_active = 1`;
    const params = [...workerIds];
    if (detailType) {
      sql += ' AND detail_type = ?';
      params.push(detailType);
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM service_detail WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  findActiveProfileImage: async (workerId, detailType) => {
    const [rows] = await db.execute(
      `SELECT * FROM service_detail WHERE worker_id = ? AND detail_type = ? AND is_active = 1 ORDER BY id DESC LIMIT 1`,
      [workerId, detailType]
    );
    return rows[0] || null;
  },

  upsertProfileImage: async (workerId, detailType, imageUrl) => {
    const existing = await serviceDetailModel.findActiveProfileImage(workerId, detailType);
    if (existing) {
      await db.execute(
        'UPDATE service_detail SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [imageUrl, existing.id]
      );
      return existing.id;
    }
    const [result] = await db.execute(
      `INSERT INTO service_detail (worker_id, detail_type, image_url) VALUES (?, ?, ?)`,
      [workerId, detailType, imageUrl]
    );
    return result.insertId;
  },

  createListing: async (data) => {
    const title =
      data.listing_kind === 'vehicle'
        ? buildVehicleTitle(data)
        : String(data.title || data.material_type || '').trim();

    const imageUrls = Array.isArray(data.image_urls) && data.image_urls.length
      ? data.image_urls.slice(0, 4)
      : [data.image_url];

    const [result] = await db.execute(
      `INSERT INTO service_detail (
        worker_id, detail_type, image_url, image_urls, title, description, rate_amount, price_type, material_type,
        listing_kind, vehicle_type, rental_mode, driver_fuel_option, model_year, company_name, model_name, included_km, extra_km_rate, fuel_cost_per_km
      ) VALUES (?, 'listing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.worker_id,
        imageUrls[0],
        JSON.stringify(imageUrls),
        title,
        data.description || null,
        data.rate_amount,
        data.price_type || 'daily',
        data.material_type || null,
        data.listing_kind || null,
        data.vehicle_type || null,
        data.rental_mode || null,
        data.driver_fuel_option || null,
        data.model_year ?? null,
        data.company_name || null,
        data.model_name || null,
        data.included_km ?? null,
        data.extra_km_rate ?? null,
        data.fuel_cost_per_km ?? null,
      ]
    );
    return result.insertId;
  },

  updateListing: async (id, workerId, data) => {
    const title =
      data.listing_kind === 'vehicle'
        ? buildVehicleTitle(data)
        : String(data.title || data.material_type || '').trim();

    const imageUrls = Array.isArray(data.image_urls) && data.image_urls.length
      ? data.image_urls.slice(0, 4)
      : data.image_url
        ? [data.image_url]
        : null;

    await db.execute(
      `UPDATE service_detail SET
        image_url = COALESCE(?, image_url),
        image_urls = COALESCE(?, image_urls),
        title = ?,
        description = ?,
        rate_amount = ?,
        price_type = ?,
        material_type = ?,
        listing_kind = ?,
        vehicle_type = ?,
        rental_mode = ?,
        driver_fuel_option = ?,
        model_year = ?,
        company_name = ?,
        model_name = ?,
        included_km = ?,
        extra_km_rate = ?,
        fuel_cost_per_km = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND worker_id = ? AND detail_type = 'listing'`,
      [
        imageUrls ? imageUrls[0] : null,
        imageUrls ? JSON.stringify(imageUrls) : null,
        title,
        data.description || null,
        data.rate_amount,
        data.price_type || 'daily',
        data.material_type || null,
        data.listing_kind || null,
        data.vehicle_type || null,
        data.rental_mode || null,
        data.driver_fuel_option || null,
        data.model_year ?? null,
        data.company_name || null,
        data.model_name || null,
        data.included_km ?? null,
        data.extra_km_rate ?? null,
        data.fuel_cost_per_km ?? null,
        id,
        workerId,
      ]
    );
    return true;
  },

  deleteById: async (id, workerId) => {
    await db.execute('DELETE FROM service_detail WHERE id = ? AND worker_id = ?', [id, workerId]);
    return true;
  },

  getListingsForWorker: async (workerId) => {
    const [rows] = await db.execute(
      `SELECT * FROM service_detail WHERE worker_id = ? AND detail_type = 'listing' AND is_active = 1 ORDER BY id DESC`,
      [workerId]
    );
    return rows.map(mapListingRow);
  },

  getListingsForWorkers: async (workerIds) => {
    if (!workerIds?.length) return [];
    const placeholders = workerIds.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT * FROM service_detail WHERE worker_id IN (${placeholders}) AND detail_type = 'listing' AND is_active = 1 ORDER BY id DESC`,
      workerIds
    );
    return rows.map(mapListingRow);
  },

  mapListingRow,
};

export async function enrichWorkerWithServiceDetails(worker) {
  if (!worker?.id) return worker;

  const details = await serviceDetailModel.findByWorkerId(worker.id);
  const imageOf = (type) => details.find((d) => d.detail_type === type)?.image_url || null;

  worker.worker_image_url = imageOf('profile_photo');
  worker.aadhar_image_url = imageOf('aadhar');
  worker.hall_image_url = imageOf('hall_photo');
  worker.service_details = details;
  worker.listings = details.filter((d) => d.detail_type === 'listing').map(mapListingRow);

  return worker;
}

export async function enrichWorkersWithServiceDetails(workers) {
  if (!workers?.length) return workers;
  const ids = workers.map((w) => w.id);
  const allDetails = await serviceDetailModel.findByWorkerIds(ids);
  const listingRows = allDetails.filter((d) => d.detail_type === 'listing').map(mapListingRow);

  return workers.map((w) => {
    const mine = allDetails.filter((d) => d.worker_id === w.id);
    const imageOf = (type) => mine.find((d) => d.detail_type === type)?.image_url || null;
    return {
      ...w,
      worker_image_url: imageOf('profile_photo'),
      aadhar_image_url: imageOf('aadhar'),
      hall_image_url: imageOf('hall_photo'),
      service_details: mine,
      listings: listingRows.filter((l) => l.worker_id === w.id),
    };
  });
}

export async function hasServiceImage(workerId, detailType) {
  const row = await serviceDetailModel.findActiveProfileImage(workerId, detailType);
  return Boolean(row?.image_url);
}
