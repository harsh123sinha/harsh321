/** Step keys used by DynamicFormEngine */
export const STEP_KEYS = {
  LISTING_TYPE: 'listingType',
  LOCATION: 'location',
  SHOP_AREA: 'shopAreaSqft',
  SHOP_BUDGET: 'shopBudget',
  BHK: 'bhk',
  FLOOR_PREF: 'floorPreference',
  FURNISHING: 'furnishing',
  HOME_BUDGET: 'homeBudget',
  PLOT_AREA: 'plotArea',
  PLOT_UNIT: 'plotAreaUnit',
  PLOT_ROAD: 'plotRoadWidth',
  PLOT_FACING: 'plotFacing',
  PLOT_BUDGET: 'plotBudget',
  OTHER_BUDGET: 'otherBudget',
  OTHER_AREA: 'otherArea',
  OTHER_DESC: 'otherDescription',
};

export function getStepsForCategory(category) {
  switch (category) {
    case 'shop':
    case 'commercial':
      return [
        STEP_KEYS.LISTING_TYPE,
        STEP_KEYS.LOCATION,
        STEP_KEYS.SHOP_AREA,
        STEP_KEYS.SHOP_BUDGET,
      ];
    case 'house_flat':
    case 'apartment':
      return [
        STEP_KEYS.LISTING_TYPE,
        STEP_KEYS.LOCATION,
        STEP_KEYS.BHK,
        STEP_KEYS.FLOOR_PREF,
        STEP_KEYS.FURNISHING,
        STEP_KEYS.HOME_BUDGET,
      ];
    case 'plots':
      return [
        STEP_KEYS.LOCATION,
        STEP_KEYS.PLOT_AREA,
        STEP_KEYS.PLOT_ROAD,
        STEP_KEYS.PLOT_FACING,
        STEP_KEYS.PLOT_BUDGET,
      ];
    case 'other':
      return [
        STEP_KEYS.LISTING_TYPE,
        STEP_KEYS.LOCATION,
        STEP_KEYS.OTHER_BUDGET,
        STEP_KEYS.OTHER_AREA,
        STEP_KEYS.OTHER_DESC,
      ];
    default:
      return [];
  }
}

export function categoryLabel(cat) {
  const map = {
    shop: 'Shop',
    commercial: 'Commercial space',
    house_flat: 'House',
    apartment: 'Apartment',
    plots: 'Plots',
    other: 'Other',
  };
  return map[cat] || cat;
}
