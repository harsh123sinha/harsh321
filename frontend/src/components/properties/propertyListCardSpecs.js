import {
  formatIndianPrice,
  getFacingLabel,
  getFurnishingLabel,
  getShopSqftRangeLabel,
} from '../../utils/helpers';

const isShop = (property) => String(property.other_type || '').toLowerCase() === 'shop';

const isPlot = (property) =>
  property.type === 'plot' ||
  property.type === 'plot_lease' ||
  property.type === 'plot_buy' ||
  (String(property.katha || '').trim() !== '' && !property.bhk && !isShop(property));

const parkingText = (property) => {
  if (property.car_parking && property.bike_parking) return 'Car + bike';
  if (property.car_parking) return 'Car';
  if (property.bike_parking) return 'Bike';
  return 'None';
};

/** Flat list of label/value rows for the OLX-style 2-column spec grid (no description). */
export const buildListCardSpecs = (property) => {
  const shop = isShop(property);
  const plot = isPlot(property);
  const rows = [];

  if (shop) {
    rows.push(
      { label: 'Size', value: getShopSqftRangeLabel(property.shop_sqft_range) || '—' },
      { label: 'Road', value: property.shop_road_distance || '—' },
      { label: 'Facing', value: getFacingLabel(property.facing) || '—' },
      {
        label: 'Token',
        value:
          property.shop_token_amount != null && Number(property.shop_token_amount) > 0
            ? formatIndianPrice(property.shop_token_amount)
            : '—',
      },
      { label: 'Parking', value: parkingText(property) },
      { label: 'Type', value: 'Shop' }
    );
    return rows;
  }

  if (plot) {
    rows.push(
      { label: 'Katha', value: property.katha ? `${property.katha} Katha` : '—' },
      { label: 'Facing', value: getFacingLabel(property.facing) || '—' },
      { label: 'Floor', value: property.floor_no || '—' },
      { label: 'Parking', value: parkingText(property) },
      { label: 'Garden', value: property.garden ? 'Yes' : 'No' },
      { label: 'Type', value: property.type?.replace('_', ' ') || 'Plot' }
    );
    return rows;
  }

  const balconyN = Number(property.balconies);
  rows.push(
    { label: 'BHK', value: property.bhk ? `${property.bhk} BHK` : '—' },
    { label: 'Floor', value: property.floor_no || '—' },
    { label: 'Furnished', value: getFurnishingLabel(property.furnishing_status) || '—' },
    { label: 'Facing', value: getFacingLabel(property.facing) || '—' },
    {
      label: 'Balcony',
      value: balconyN > 0 ? String(balconyN) : 'None',
    },
    {
      label: 'Bath',
      value:
        property.bathrooms != null && Number(property.bathrooms) > 0
          ? String(property.bathrooms)
          : '—',
    },
    { label: 'Parking', value: parkingText(property) }
  );

  if (property.garden) rows.push({ label: 'Garden', value: 'Yes' });
  if (property.other_type && !shop) {
    rows.push({ label: 'Subtype', value: property.other_type });
  }

  return rows;
};

/** Single-line specs for mobile list cards (OLX: "3 BHK - 3 Bath - East"). */
export const buildOlxMobileSpecLine = (property) => {
  const shop = isShop(property);
  const plot = isPlot(property);
  const parts = [];

  if (shop) {
    const size = getShopSqftRangeLabel(property.shop_sqft_range);
    if (size) parts.push(size);
    if (property.shop_road_distance) parts.push(`Road ${property.shop_road_distance}`);
    const facing = getFacingLabel(property.facing);
    if (facing) parts.push(facing);
    return parts.join(' - ');
  }

  if (plot) {
    const facing = getFacingLabel(property.facing);
    if (facing) parts.push(facing);
    if (property.floor_no) parts.push(`Floor ${property.floor_no}`);
    const park = parkingText(property);
    if (park && park !== 'None') parts.push(park);
    return parts.join(' - ');
  }

  // BHK shown on image corner — omit from right-side spec line
  if (property.bathrooms != null && Number(property.bathrooms) > 0) {
    parts.push(`${property.bathrooms} Bath`);
  }
  const furnish = getFurnishingLabel(property.furnishing_status);
  if (furnish) parts.push(furnish);
  const facing = getFacingLabel(property.facing);
  if (facing) parts.push(facing);
  if (property.floor_no) parts.push(`Floor ${property.floor_no}`);
  const balconyN = Number(property.balconies);
  if (balconyN > 0) parts.push(`${balconyN} Balcony`);

  const park = parkingText(property);
  if (park && park !== 'None') parts.push(park);

  return parts.join(' - ');
};

export const getListTypeBadge = (type) => {
  const map = {
    rent: 'RENT',
    buy: 'SALE',
    plot: 'PLOT',
    plot_lease: 'PLOT',
    plot_buy: 'PLOT',
    other: 'OTHER',
  };
  return map[type] || 'LISTING';
};

/** Top-left overlay on listing photo (e.g. 3 BHK, 2 Katha, Shop). */
export const getImageCornerLabel = (property) => {
  const shop = isShop(property);
  const plot = isPlot(property);

  if (shop) {
    const size = getShopSqftRangeLabel(property.shop_sqft_range);
    return 'SHOP';
  }
  if (plot) {
    if (property.katha) return `${property.katha} Katha`;
    return 'PLOT';
  }
  if (property.bhk) return `${property.bhk} BHK`;
  if (property.other_type) return String(property.other_type);
  return '';
};
