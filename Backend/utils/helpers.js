// Indian price formatting helper
export const formatIndianPrice = (price) => {
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) return '₹0';
  
  // 1 Crore = 10,000,000
  if (numPrice >= 10000000) {
    const crores = numPrice / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
  }
  
  // 1 Lakh = 100,000
  if (numPrice >= 100000) {
    const lakhs = numPrice / 100000;
    return `₹${lakhs.toFixed(2)} Lakh`;
  }
  
  // Thousands with Indian grouping
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numPrice);
};

// Validate Indian mobile number
export const isValidIndianMobile = (phone) => {
  const indianMobileRegex = /^[6-9]\d{9}$/;
  return indianMobileRegex.test(phone);
};

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Parse image_url JSON field safely
export const parseImageUrls = (imageUrl) => {
  if (!imageUrl) return [];
  
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

// Convert image filenames array to JSON string for DB
export const stringifyImageUrls = (imageArray) => {
  if (!Array.isArray(imageArray)) return JSON.stringify([]);
  return JSON.stringify(imageArray);
};

import { PLOT_TYPES, SHOP_SQFT_RANGE_VALUES } from './propertyConstants.js';

// Validate property type-specific fields
export const validatePropertyFields = (type, fields) => {
  const errors = [];
  const t = (type || '').trim();

  if (PLOT_TYPES.includes(t)) {
    if (!fields.katha || String(fields.katha).trim() === '') {
      errors.push('Katha is required for plot listings (choose a size or enter a decimal value)');
    }
    return errors;
  }

  if (t === 'rent' || t === 'buy') {
    const ot = String(fields.other_type ?? '').trim();
    if (ot === 'Shop') {
      const r = String(fields.shop_sqft_range ?? '').trim();
      if (!SHOP_SQFT_RANGE_VALUES.includes(r)) {
        errors.push('Select a shop size range (sq ft)');
      }
      return errors;
    }

    const hasBhk = fields.bhk != null && String(fields.bhk).trim() !== '';
    const hasSubtype = ot !== '';
    if (!hasBhk && !hasSubtype) {
      errors.push('Enter BHK (for homes) or choose a building type (Shop / Flat / Apartment)');
    }
  }

  if (t === 'other' && (!fields.other_type || String(fields.other_type).trim() === '')) {
    errors.push('Other type specification is required');
  }

  return errors;
};

/** Normalize to 10-digit Indian mobile for storage; empty string if invalid. */
export function normalizeIndianMobile(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10 && /^[6-9]/.test(d)) return d;
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return '';
}
