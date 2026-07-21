/**
 * Map a numeric shop area (sq ft) to the closest backend `shop_sqft_range` bucket.
 */
export function mapNumericSqftToShopRange(sqft) {
  const n = Number(sqft);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n <= 800) return '200-800';
  if (n <= 1500) return '800-1500';
  if (n <= 2000) return '1500-2000';
  return '2000+';
}

/**
 * Build query params for GET /properties/search from wizard answers.
 */
export function buildSearchParams(category, answers) {
  const params = new URLSearchParams();
  const loc = String(answers.location || '').trim();
  if (loc) params.set('location', loc);

  const minP =
    answers.budgetMin != null && String(answers.budgetMin).trim() !== ''
      ? String(answers.budgetMin).trim()
      : '';
  const maxP =
    answers.budgetMax != null && String(answers.budgetMax).trim() !== ''
      ? String(answers.budgetMax).trim()
      : '';
  if (minP) params.set('minPrice', minP);
  if (maxP) params.set('maxPrice', maxP);

  const listingType = answers.listingType === 'buy' ? 'buy' : 'rent';

  if (category === 'shop') {
    params.set('type', listingType);
    params.set('other_type', 'Shop');
    const range =
      answers.shopSqftRange || mapNumericSqftToShopRange(answers.shopAreaSqft);
    if (range) params.set('shop_sqft_range', range);
    return params;
  }

  if (category === 'commercial') {
    params.set('type', listingType);
    params.set('other_type', 'Commercial space');
    const range =
      answers.shopSqftRange || mapNumericSqftToShopRange(answers.shopAreaSqft);
    if (range) params.set('shop_sqft_range', range);
    return params;
  }

  if (category === 'house_flat') {
    params.set('type', listingType);
    if (answers.bhk) params.set('bhk', String(answers.bhk));
    return params;
  }

  if (category === 'apartment') {
    params.set('type', listingType);
    params.set('other_type', 'Apartment');
    if (answers.bhk) params.set('bhk', String(answers.bhk));
    return params;
  }

  if (category === 'plots') {
    params.set('type', 'plot');
    return params;
  }

  if (category === 'other') {
    if (listingType === 'buy') params.set('type', 'buy');
    else params.set('type', 'rent');
    const hint = String(answers.description || '').trim().slice(0, 48);
    if (hint) params.set('other_type', hint);
    return params;
  }

  return params;
}

/**
 * Client-side refinement (search API does not filter furnishing / floor / facing).
 */
export function refineResults(category, answers, properties) {
  if (!Array.isArray(properties)) return [];

  const isPlotRow = (p) =>
    p?.type === 'plot' || p?.type === 'plot_lease' || p?.type === 'plot_buy';
  const ot = (p) => String(p?.other_type || '').toLowerCase();

  let list = properties;

  if (category === 'shop') {
    list = list.filter((p) => ot(p) === 'shop');
  }

  if (category === 'commercial') {
    list = list.filter((p) => ot(p) === 'commercial space');
  }

  if (category === 'house_flat') {
    list = list.filter(
      (p) =>
        !isPlotRow(p) &&
        ot(p) !== 'shop' &&
        ot(p) !== 'commercial space' &&
        ot(p) !== 'apartment'
    );
  }

  if (category === 'apartment') {
    list = list.filter((p) => ot(p) === 'apartment' && !isPlotRow(p));
  }

  if (category === 'plots') {
    list = list.filter((p) => isPlotRow(p));
  }

  const furnish = String(answers.furnishing || '').trim();
  if (furnish && (category === 'house_flat' || category === 'apartment')) {
    list = list.filter((p) => String(p.furnishing_status || '') === furnish);
  }

  return list;
}
