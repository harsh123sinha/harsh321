import { userDemandModel } from '../models/userDemandModel.js';
import { notifyUserDemand } from '../services/staffAlertService.js';

const CATEGORIES = ['homes', 'flat', 'apartment', 'shop', 'commercial', 'plot', 'other'];
const LISTING_TYPES = ['rent', 'buy', 'plot_lease', 'plot_buy'];

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(String(mobile || '').replace(/\D/g, ''));
}

function parseBudget(value) {
  if (value == null || String(value).trim() === '') return null;
  const n = parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const createUserDemand = async (req, res) => {
  try {
    const {
      contact_phone,
      contact_name,
      category,
      listing_type,
      requirements,
      location,
      city,
      bhk,
      floor_pref,
      facing,
      furnishing,
      shop_sqft_range,
      katha,
      budget_min,
      budget_max,
    } = req.body;

    const phone = String(contact_phone || '').replace(/\D/g, '').slice(-10);
    if (!isValidMobile(phone)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
    }

    const cat = String(category || '').trim().toLowerCase();
    if (!CATEGORIES.includes(cat)) {
      return res.status(400).json({ error: 'Select a valid property category.' });
    }

    const listingType = listing_type ? String(listing_type).trim() : null;
    if (listingType && !LISTING_TYPES.includes(listingType)) {
      return res.status(400).json({ error: 'Invalid listing type.' });
    }

    const reqText = String(requirements || '').trim();
    if (!reqText) {
      return res.status(400).json({ error: 'Please describe your requirements.' });
    }
    if (reqText.length > 2000) {
      return res.status(400).json({ error: 'Requirements text is too long (max 2000 characters).' });
    }

    const isHomeLike = cat === 'homes' || cat === 'flat' || cat === 'apartment';
    if (isHomeLike && !String(bhk || '').trim()) {
      return res.status(400).json({ error: 'BHK is required for homes / flats / apartments.' });
    }
    if (cat === 'shop' && !listingType) {
      return res.status(400).json({ error: 'Select rent or buy for shop.' });
    }
    if (isHomeLike && !listingType) {
      return res.status(400).json({ error: 'Select rent or buy.' });
    }
    if (cat === 'plot' && !listingType) {
      return res.status(400).json({ error: 'Select plot lease or plot buy.' });
    }

    const budgetMin = parseBudget(budget_min);
    const budgetMax = parseBudget(budget_max);
    if (budgetMin != null && budgetMax != null && budgetMin > budgetMax) {
      return res.status(400).json({ error: 'Budget min cannot be greater than budget max.' });
    }

    const id = await userDemandModel.create({
      contact_phone: phone,
      contact_name: String(contact_name || '').trim() || null,
      category: cat,
      listing_type: listingType,
      requirements: reqText,
      location: String(location || '').trim() || null,
      city: String(city || '').trim() || 'Patna',
      bhk: isHomeLike ? String(bhk).trim() : null,
      floor_pref: isHomeLike ? String(floor_pref || '').trim() || null : null,
      facing: String(facing || '').trim() || null,
      furnishing: isHomeLike ? String(furnishing || '').trim() || null : null,
      shop_sqft_range: cat === 'shop' ? String(shop_sqft_range || '').trim() || null : null,
      katha: cat === 'plot' ? String(katha || '').trim() || null : null,
      budget_min: budgetMin,
      budget_max: budgetMax,
    });

    notifyUserDemand({
      id,
      contact_phone: phone,
      category: cat,
      location: String(location || '').trim() || null,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your demand is saved. Our team will contact you soon.',
      demandId: id,
    });
  } catch (error) {
    console.error('Create user demand error:', error);
    res.status(500).json({ error: 'Could not save your demand. Please try again.' });
  }
};

export const adminListUserDemands = async (req, res) => {
  try {
    const rows = await userDemandModel.findAll({
      status: req.query.status,
      q: req.query.q,
    });
    res.json({ success: true, demands: rows });
  } catch (error) {
    console.error('List user demands error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const adminUpdateUserDemandStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'matched', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await userDemandModel.updateStatus(req.params.id, status);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update user demand status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
