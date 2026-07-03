import { FACING_OPTIONS, FURNISHING_OPTIONS } from '../../constants/propertyForm';

export const BATHROOM_OPTIONS = [
  { value: '1', label: '1 Bathroom' },
  { value: '2', label: '2 Bathrooms' },
  { value: '3', label: '3 Bathrooms' },
  { value: '4', label: '4 Bathrooms' },
  { value: '4+', label: '4+ Bathrooms' },
];

export const BHK_OPTIONS = [
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4 BHK' },
  { value: '5', label: '4+ BHK' },
];

export const FACING_CHIPS = FACING_OPTIONS.filter((o) => o.value).map((o) => ({
  value: o.value,
  label: o.label,
}));

export const FURNISHING_CHIPS = FURNISHING_OPTIONS.filter((o) => o.value).map((o) => ({
  value: o.value,
  label: o.label.replace('-', '-'),
}));

export const PROPERTY_TYPE_CHIPS = [
  { value: 'homes', label: 'Homes & flats', other_type: '' },
  { value: 'flat', label: 'Flats / Apartments', other_type: 'Flat' },
  { value: 'apartment', label: 'Apartments', other_type: 'Apartment' },
  { value: 'shop', label: 'Shop', other_type: 'Shop' },
  { value: 'plot', label: 'Plot', other_type: '' },
];

export const PARKING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3+', label: '3+' },
];

export const SORT_OPTIONS = [
  { value: 'date', label: 'Date Published' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export const BUDGET_MAX = 500000;
export const BUDGET_STEP = 5000;

export function formatBudgetLabel(n) {
  if (n >= BUDGET_MAX) return `${BUDGET_MAX.toLocaleString('en-IN')}+`;
  return `₹ ${Number(n).toLocaleString('en-IN')}`;
}

export function filtersToSearchParams(state) {
  const params = new URLSearchParams();
  if (state.location) params.set('location', state.location);
  if (state.type) params.set('type', state.type);
  if (state.bhk) params.set('bhk', state.bhk);
  if (state.bathrooms) params.set('bathrooms', state.bathrooms);
  if (state.facing) params.set('facing', state.facing);
  if (state.furnishing) params.set('furnishing_status', state.furnishing);
  if (state.car_parking) params.set('car_parking', state.car_parking);
  if (state.other_type) params.set('other_type', state.other_type);
  if (state.shop_sqft_range) params.set('shop_sqft_range', state.shop_sqft_range);
  if (state.katha) params.set('katha', state.katha);
  if (state.minPrice > 0) params.set('minPrice', String(state.minPrice));
  if (state.maxPrice < BUDGET_MAX) params.set('maxPrice', String(state.maxPrice));
  if (state.sort && state.sort !== 'date') params.set('sort', state.sort);
  return params;
}

export function searchParamsToFilterState(searchParams, presetLocation = '', presetType = '') {
  const type = searchParams.get('type') || presetType || 'rent';
  const other = searchParams.get('other_type') || '';
  let propertyKind = 'homes';
  if (type === 'plot' || type === 'plot_lease' || type === 'plot_buy') propertyKind = 'plot';
  else if (other.toLowerCase() === 'shop') propertyKind = 'shop';
  else if (other.toLowerCase() === 'flat') propertyKind = 'flat';
  else if (other.toLowerCase() === 'apartment') propertyKind = 'apartment';

  return {
    location: searchParams.get('location') || presetLocation || '',
    type,
    propertyKind,
    bhk: searchParams.get('bhk') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    facing: searchParams.get('facing') || '',
    furnishing: searchParams.get('furnishing_status') || '',
    car_parking: searchParams.get('car_parking') || '',
    other_type: other,
    shop_sqft_range: searchParams.get('shop_sqft_range') || '',
    katha: searchParams.get('katha') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || BUDGET_MAX,
    sort: searchParams.get('sort') || 'date',
  };
}

export function buildFilterPayload(state) {
  let typeParam = state.type || 'rent';
  let otherTypeParam = state.other_type || '';

  if (state.propertyKind === 'plot') {
    typeParam = 'plot';
    otherTypeParam = '';
  } else if (state.propertyKind === 'shop') {
    typeParam = state.type === 'buy' ? 'buy' : 'rent';
    otherTypeParam = 'Shop';
  } else if (state.propertyKind === 'flat') {
    typeParam = state.type === 'buy' ? 'buy' : 'rent';
    otherTypeParam = 'Flat';
  } else if (state.propertyKind === 'apartment') {
    typeParam = state.type === 'buy' ? 'buy' : 'rent';
    otherTypeParam = 'Apartment';
  }

  return {
    location: state.location || '',
    type: typeParam,
    bhk: state.bhk || '',
    bathrooms: state.bathrooms || '',
    facing: state.facing || '',
    furnishing_status: state.furnishing || '',
    car_parking: state.car_parking || '',
    other_type: otherTypeParam,
    shop_sqft_range: state.shop_sqft_range || '',
    katha: state.katha || '',
    minPrice: state.minPrice > 0 ? String(state.minPrice) : '',
    maxPrice: state.maxPrice < BUDGET_MAX ? String(state.maxPrice) : '',
    sort: state.sort || 'date',
  };
}
