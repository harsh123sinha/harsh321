import db from '../config/database.js';
import { formatEmployeeId } from '../utils/employeeId.js';

export const workerModel = {
  findByUserId: async (userId) => {
    const [rows] = await db.execute('SELECT * FROM worker WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM worker WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const query = `
      INSERT INTO worker (
        user_id, name, email, phone_number, profession, profile_type,
        description, working_hours_per_day, off_day,
        price_type, price_amount, area_sqft, outside_caterers_allowed, catering_type,
        hall_booking_cost, veg_platter_cost, nonveg_platter_cost, profile_complete
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      data.user_id,
      data.name,
      data.email,
      data.phone_number,
      data.profession,
      data.profile_type || 'standard',
      data.description,
      data.working_hours_per_day ?? null,
      data.off_day || null,
      data.price_type || null,
      data.price_amount ?? null,
      data.area_sqft ?? null,
      data.outside_caterers_allowed != null ? (data.outside_caterers_allowed ? 1 : 0) : null,
      data.catering_type || null,
      data.hall_booking_cost ?? null,
      data.veg_platter_cost ?? null,
      data.nonveg_platter_cost ?? null,
      data.profile_complete ? 1 : 0,
    ]);
    return result.insertId;
  },

  updateByUserId: async (userId, data) => {
    const query = `
      UPDATE worker SET
        name = ?,
        email = ?,
        phone_number = ?,
        profession = ?,
        profile_type = ?,
        description = ?,
        working_hours_per_day = ?,
        off_day = ?,
        price_type = ?,
        price_amount = ?,
        area_sqft = ?,
        outside_caterers_allowed = ?,
        catering_type = ?,
        hall_booking_cost = ?,
        veg_platter_cost = ?,
        nonveg_platter_cost = ?,
        profile_complete = ?
      WHERE user_id = ?
    `;
    await db.execute(query, [
      data.name,
      data.email,
      data.phone_number,
      data.profession,
      data.profile_type || 'standard',
      data.description,
      data.working_hours_per_day ?? null,
      data.off_day || null,
      data.price_type || null,
      data.price_amount ?? null,
      data.area_sqft ?? null,
      data.outside_caterers_allowed != null ? (data.outside_caterers_allowed ? 1 : 0) : null,
      data.catering_type || null,
      data.hall_booking_cost ?? null,
      data.veg_platter_cost ?? null,
      data.nonveg_platter_cost ?? null,
      data.profile_complete ? 1 : 0,
      userId,
    ]);
    return true;
  },

  searchPublic: async ({ professions = [], q = '' } = {}) => {
    let query = `
      SELECT w.*, u.name AS user_name
      FROM worker w
      JOIN \`user\` u ON u.id = w.user_id
      WHERE w.profile_complete = 1
    `;
    const params = [];

    if (professions.length) {
      query += ` AND w.profession IN (${professions.map(() => '?').join(',')})`;
      params.push(...professions);
    }

    const term = String(q || '').trim();
    if (term) {
      query += ` AND (w.name LIKE ? OR w.profession LIKE ? OR w.description LIKE ?)`;
      const like = `%${term}%`;
      params.push(like, like, like);
    }

    query += ' ORDER BY w.updated_at DESC LIMIT 200';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  ensureEmployeeId: async (workerId) => {
    const worker = await workerModel.findById(workerId);
    if (!worker) return null;
    if (worker.employee_id) return worker.employee_id;
    const employee_id = formatEmployeeId(workerId);
    await db.execute('UPDATE worker SET employee_id = ? WHERE id = ?', [employee_id, workerId]);
    return employee_id;
  },
};
