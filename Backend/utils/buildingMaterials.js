/** Building material catalogue — keep in sync with frontend workerProfileTypes.js */

export const BUILDING_MATERIAL_TYPES = [
  { value: 'balu_ujla', label: 'Balu (Ujla)', price_type: 'per_trolley' },
  { value: 'balu_bhura', label: 'Balu (Bhura)', price_type: 'per_trolley' },
  { value: 'gitti', label: 'Gitti / Small stone', price_type: 'per_trolley' },
  { value: 'brick', label: 'Brick (Eeta)', price_type: 'per_trolley' },
  { value: 'cement', label: 'Cement', price_type: 'per_bag' },
];

export function getBuildingMaterialByValue(value) {
  const v = String(value || '').trim().toLowerCase();
  return BUILDING_MATERIAL_TYPES.find((m) => m.value === v) || null;
}

export function getBuildingMaterialByLabel(label) {
  const s = String(label || '').trim().toLowerCase();
  return (
    BUILDING_MATERIAL_TYPES.find((m) => m.label.toLowerCase() === s) ||
    BUILDING_MATERIAL_TYPES.find((m) => m.value === s) ||
    null
  );
}

/** Accept slug value or display label (legacy free-text rows). */
export function resolveBuildingMaterial(input) {
  return getBuildingMaterialByValue(input) || getBuildingMaterialByLabel(input);
}

export function isValidBuildingMaterialType(input) {
  return Boolean(resolveBuildingMaterial(input));
}

export function getMaterialPriceTypeForInput(input) {
  return resolveBuildingMaterial(input)?.price_type || null;
}
