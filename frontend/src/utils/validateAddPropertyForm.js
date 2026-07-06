import { getContactFieldError } from './contactValidation';
import { getRoadNoFieldError } from './roadNoValidation';
import { containsPhoneNumber, getListingProseCombined } from './containsPhoneNumber';
import { getTitleWordLimitError } from './listingTitleUtils';

export function validateAddPropertyForm({
  formData,
  kathaPreset,
  kathaDecimal,
  images,
  isPlot,
  isOther,
  isShop,
  showBhkAndAmenities,
  showFurnishing,
}) {
  const errors = {};

  if (!String(formData.title || '').trim()) errors.title = 'Title is required.';
  if (!String(formData.description || '').trim()) errors.description = 'Description is required.';
  if (!String(formData.price || '').trim()) errors.price = 'Price is required.';
  else if (!/^\d+$/.test(String(formData.price).trim())) errors.price = 'Price must be numbers only.';
  if (!String(formData.location || '').trim()) errors.location = 'Location is required.';
  if (!String(formData.city || '').trim()) errors.city = 'City is required.';
  if (!isPlot && formData.road_no) {
    const roadErr = getRoadNoFieldError(formData.road_no);
    if (roadErr) errors.road_no = roadErr;
  }
  if (!images?.length) errors.images = 'At least one property image is required.';

  const titleWordErr = getTitleWordLimitError(formData.title);
  if (titleWordErr) errors.title = titleWordErr;

  const proseCheck = containsPhoneNumber(getListingProseCombined(formData));
  if (proseCheck.blocked) {
    errors.listingProse = proseCheck.reason;
    errors.title = proseCheck.reason;
    errors.description = proseCheck.reason;
  }

  if (isOther && !String(formData.otherDescription || '').trim()) {
    errors.otherDescription = 'Property type description is required.';
  }

  if (isShop && !String(formData.shopSqftRange || '').trim()) {
    errors.shopSqftRange = 'Shop size is required.';
  }

  if (showBhkAndAmenities && !isShop && !isPlot && !isOther && formData.builtUpAreaSqft) {
    if (!/^\d+$/.test(String(formData.builtUpAreaSqft).trim())) {
      errors.builtUpAreaSqft = 'Built-up area must be numbers only.';
    }
  }

  if (formData.pincode && !/^\d{6}$/.test(String(formData.pincode).trim())) {
    errors.pincode = 'Pincode must be 6 digits.';
  }

  if (isPlot) {
    const kathaVal = (kathaPreset === 'custom' ? kathaDecimal : kathaPreset).trim();
    if (!kathaVal) errors.katha = 'Katha is required.';
  }

  if (showBhkAndAmenities && !isShop) {
    if (!String(formData.bhk || '').trim()) errors.bhk = 'BHK is required.';
    else if (!/^\d+$/.test(String(formData.bhk).trim())) errors.bhk = 'BHK must be numbers only.';
    if (!String(formData.balconies || '').trim() && formData.balconies !== 0) {
      errors.balconies = 'Number of balconies is required (use 0 if none).';
    } else if (formData.balconies !== '' && !/^\d+$/.test(String(formData.balconies).trim())) {
      errors.balconies = 'Balconies must be numbers only.';
    }
    if (!String(formData.bathrooms || '').trim() && formData.bathrooms !== 0) {
      errors.bathrooms = 'Number of bathrooms is required (use 0 if none).';
    } else if (formData.bathrooms !== '' && !/^\d+$/.test(String(formData.bathrooms).trim())) {
      errors.bathrooms = 'Bathrooms must be numbers only.';
    }
    if (!String(formData.floor_no || '').trim()) errors.floor_no = 'Floor number is required.';
    else if (!/^\d+$/.test(String(formData.floor_no).trim())) {
      errors.floor_no = 'Floor must be numbers only (use 0 for ground).';
    }
    if (showFurnishing && !String(formData.furnishing || '').trim()) {
      errors.furnishing = 'Furnishing status is required.';
    }
    const parkingOk =
      formData.no_parking || formData.car_parking || formData.bike_parking;
    if (!parkingOk) {
      errors.parking = 'Select Car parking, Bike parking, or No parking.';
    }
  }

  if (showBhkAndAmenities && isShop) {
    if (!String(formData.shopRoadDistance || '').trim()) {
      errors.shopRoadDistance = 'Road distance is required.';
    }
    if (formData.shopTokenAmount === '' || formData.shopTokenAmount == null) {
      errors.shopTokenAmount = 'Token amount is required (use 0 if not applicable).';
    }
    const parkingOk =
      formData.no_parking || formData.car_parking || formData.bike_parking;
    if (!parkingOk) {
      errors.parking = 'Select Car parking, Bike parking, or No parking.';
    }
  }

  const textFields = [
    'location',
    'otherDescription',
    'shopRoadDistance',
  ];

  for (const name of textFields) {
    const val = formData[name];
    if (!val) continue;
    const contactErr = getContactFieldError(val);
    if (contactErr) errors[name] = contactErr;
  }

  if (kathaPreset === 'custom' && kathaDecimal) {
    const contactErr = getContactFieldError(kathaDecimal);
    if (contactErr) errors.katha = contactErr;
  }

  return errors;
}
