import { parseImageUrls, formatIndianPrice } from './helpers.js';

const RENT_TYPES = new Set(['rent', 'plot_lease']);

export function getFrontendOrigin() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  const first = raw.split(',')[0].trim();
  return first.replace(/\/+$/, '');
}

export function getDefaultPropertyImageUrl() {
  return `${getFrontendOrigin()}/assets/default-property.svg`;
}

export function formatPropertyPriceLabel(property) {
  const formatted = formatIndianPrice(property?.price);
  if (String(property?.price_unit || '') === 'per_sqft') {
    return `${formatted}/sq ft`;
  }
  if (property?.type && RENT_TYPES.has(property.type)) {
    return `${formatted}/month`;
  }
  return formatted;
}

export function formatPropertyTypeLabel(property) {
  if (property?.bhk) return `${property.bhk}BHK`;
  const other = property?.other_type ? String(property.other_type).trim() : '';
  if (other) return other;
  if (property?.type === 'plot' || property?.type === 'plot_lease' || property?.type === 'plot_buy') {
    return 'Plot';
  }
  if (property?.type === 'buy') return 'Property for sale';
  if (property?.type === 'rent') return 'Property for rent';
  return property?.title || 'Property';
}

export function getPropertyFirstImageUrl(property) {
  const images = parseImageUrls(property?.image_url);
  const first = images[0];
  if (!first) return getDefaultPropertyImageUrl();
  if (/^https?:\/\//i.test(first)) return first;
  return `${getFrontendOrigin()}${first.startsWith('/') ? '' : '/'}${first}`;
}

export function buildPropertyLocationLabel(property) {
  const parts = [property?.location, property?.city].map((s) => String(s || '').trim()).filter(Boolean);
  return parts.join(', ') || 'Patna';
}

/**
 * Card + push metadata stored in notifications.data_json
 */
export function buildPropertyNotificationData(property) {
  const propertyId = String(property.id);
  const propertyUrl = `/property/${propertyId}`;
  const propertyImage = getPropertyFirstImageUrl(property);
  const propertyTitle = String(property.title || formatPropertyTypeLabel(property)).trim();
  const propertyLocation = buildPropertyLocationLabel(property);
  const propertyPriceLabel = formatPropertyPriceLabel(property);
  const typeLabel = formatPropertyTypeLabel(property);

  return {
    propertyId,
    propertyUrl,
    propertyImage,
    propertyTitle,
    propertyPrice: String(property.price ?? ''),
    propertyPriceLabel,
    propertyLocation,
    typeLabel,
    absolutePropertyUrl: `${getFrontendOrigin()}${propertyUrl}`,
  };
}
