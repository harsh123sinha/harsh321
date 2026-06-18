import { SHOP_SQFT_RANGES, FURNISHING_OPTIONS } from '../constants/propertyForm';

// Indian price formatting
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

// Parse image URLs from JSON string or array
export const parseImageUrls = (imageUrl) => {
  if (!imageUrl) return [];
  
  if (typeof imageUrl === 'string') {
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  
  return Array.isArray(imageUrl) ? imageUrl : [];
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get property type badge color
export const getPropertyTypeBadge = (type) => {
  const badges = {
    rent: { bg: 'bg-blue-500', text: 'For Rent' },
    buy: { bg: 'bg-green-500', text: 'For Sale' },
    plot: { bg: 'bg-purple-500', text: 'Plot' },
    plot_lease: { bg: 'bg-purple-600', text: 'Plot (Lease)' },
    plot_buy: { bg: 'bg-purple-700', text: 'Plot (Buy)' },
    other: { bg: 'bg-orange-500', text: 'Other' }
  };
  return badges[type] || badges.other;
};

/** Human label for `properties.shop_sqft_range` (Shop listings). */
export const getShopSqftRangeLabel = (value) => {
  if (value == null || String(value).trim() === '') return '';
  const v = String(value).trim();
  const row = SHOP_SQFT_RANGES.find((r) => r.value === v);
  return row ? row.label : v;
};

/** Human label for `properties.furnishing_status` (home / flat / apartment). */
export const getFurnishingLabel = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return '';
  const row = FURNISHING_OPTIONS.find((r) => r.value === v);
  return row ? row.label : v;
};

/** Digits only; 10-digit Indian mobile → prefix 91 for wa.me */
export const normalizePhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

/** Site origin for listing links (SSR-safe fallback via VITE_PUBLIC_SITE_URL) */
export const getSiteOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return String(import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');
};

export const getPropertyListingUrl = (propertyId) => {
  const base = getSiteOrigin();
  if (!base || !propertyId) return '';
  return `${base}/property/${propertyId}`;
};

/** Default 10-digit mobile for all public property inquiries when env vars are unset. */
export const DEFAULT_SITE_INQUIRY_PHONE = '9334072476';

/** Who posted the listing — for Contact Us / transparency */
export const getListingParty = (ownerRole) => {
  const r = (ownerRole || '').toLowerCase().trim();
  if (r === 'owner') {
    return {
      key: 'owner',
      label: 'Direct owner listing',
      description:
        'Listed by the owner. Owner numbers stay private — call or WhatsApp Harsh To Let Services below.',
    };
  }
  if (r === 'agent') {
    return {
      key: 'broker',
      label: 'Broker',
      description: 'Listed by a broker. All inquiries go through Harsh To Let Services — contact us below.',
    };
  }
  return {
    key: 'platform',
    label: 'Harsh To Let Services',
    description: 'Managed by Harsh To Let Services. Call or WhatsApp us below.',
  };
};

/** tel: URI for Indian mobiles (10 digits starting 6–9) or other digit strings */
export const toTelHref = (raw) => {
  const d = String(raw || '').replace(/\D/g, '');
  if (!d) return '#';
  if (d.length === 10 && /^[6-9]/.test(d)) return `tel:+91${d}`;
  if (d.length >= 11 && d.startsWith('91')) return `tel:+${d}`;
  return `tel:+91${d}`;
};

/** Public inquiries always go to the business line(s), never the owner's phone. */
export const getWhatsAppRecipientForProperty = (_property) => {
  const page = import.meta.env.VITE_CONTACT_PAGE_WHATSAPP;
  if (page != null && String(page).trim() !== '') {
    return normalizePhoneForWhatsApp(String(page).trim());
  }
  const fallback = import.meta.env.VITE_WHATSAPP_DEFAULT_NUMBER;
  if (fallback) return normalizePhoneForWhatsApp(String(fallback).trim());
  return normalizePhoneForWhatsApp(DEFAULT_SITE_INQUIRY_PHONE);
};

const WHATSAPP_DESC_MAX = 900;
const WHATSAPP_MAX_IMAGE_LINKS = 8;

/** Base URL for `/images/:file` (same logic as `api.js` getImageUrl) */
const getBackendBaseForStaticFiles = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const trimmed = apiBase.replace(/\/api\/?$/, '');
  return trimmed || 'http://localhost:5000';
};

export const getPublicImageUrl = (filename) => {
  if (!filename) return '';
  return `${getBackendBaseForStaticFiles()}/images/${encodeURIComponent(filename)}`;
};

/**
 * Pre-filled inquiry text (user still taps Send in WhatsApp).
 * Note: WhatsApp click-to-chat cannot attach files; we include direct image URLs instead.
 */
export const buildPropertyWhatsAppMessage = (property, listingUrl) => {
  if (!property) return '';
  const desc =
    property.description && property.description.length > WHATSAPP_DESC_MAX
      ? `${property.description.slice(0, WHATSAPP_DESC_MAX)}…`
      : property.description || '';

  const lines = [
    'Hi, I am interested in this property on HarshToLetServices:',
    '',
    `*Title:* ${property.title}`,
    `*Price:* ${formatIndianPrice(property.price)}`,
    `*Listing type:* ${property.type || ''}`,
  ];
  if (property.bhk) lines.push(`*BHK:* ${property.bhk}`);
  if (property.katha) lines.push(`*Katha:* ${property.katha}`);
  if (property.other_type) lines.push(`*Other type:* ${property.other_type}`);
  lines.push(
    `*Location:* ${property.location}, ${property.city}, ${property.district}, ${property.state}${property.pincode ? ` - ${property.pincode}` : ''}`,
    '',
    '*Description:*',
    desc
  );

  const imageFiles = parseImageUrls(property.image_url);
  if (imageFiles.length > 0) {
    lines.push('', '*Photos (open links below):*');
    const shown = imageFiles.slice(0, WHATSAPP_MAX_IMAGE_LINKS);
    shown.forEach((name, i) => {
      const u = getPublicImageUrl(name);
      if (u) lines.push(`${i + 1}. ${u}`);
    });
    if (imageFiles.length > WHATSAPP_MAX_IMAGE_LINKS) {
      lines.push(`… +${imageFiles.length - WHATSAPP_MAX_IMAGE_LINKS} more on the listing page.`);
    }
  }

  if (listingUrl) lines.push('', `*Listing link:* ${listingUrl}`);
  lines.push('', `*Property ID:* ${property.id}`);
  return lines.join('\n');
};

/** https://wa.me/&lt;country+number&gt;?text=… — returns '' if no recipient configured */
export const getPropertyWhatsAppHref = (property, listingUrl, recipientOverride) => {
  let to = '';
  if (recipientOverride != null && String(recipientOverride).trim() !== '') {
    to = normalizePhoneForWhatsApp(String(recipientOverride).trim());
  } else {
    to = getWhatsAppRecipientForProperty(property);
  }
  if (!to) return '';
  const text = buildPropertyWhatsAppMessage(property, listingUrl);
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
};
