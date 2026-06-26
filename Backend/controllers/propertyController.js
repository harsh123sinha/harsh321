import { propertyModel } from '../models/propertyModel.js';
import { normEmail } from '../middleware/auth.js';
import { parseImageUrls, stringifyImageUrls, validatePropertyFields } from '../utils/helpers.js';
import { VALID_PROPERTY_TYPES, SHOP_SQFT_RANGE_VALUES, parseFurnishingForDb } from '../utils/propertyConstants.js';
import { normalizeListingLocation } from '../utils/listingLocation.js';
import {
  parseOptionalInt,
  parseBool01,
  mergeOptionalInt,
  mergeBool01,
  mergeFloorNo,
  mergeShopSqftRange,
  mergeShopRoadDistance,
  mergeShopTokenAmount,
  mergeFurnishingStatus,
  mergeRoadNo,
  parseRoadNo
} from '../utils/propertyAmenities.js';
import {
  uploadProcessedFilesToS3,
  resolvePropertyImageUrls,
  deleteAllPropertyImages,
} from '../utils/s3.js';
import {
  assertListingTextAllowed,
  processPropertyImagesForUpload,
  assertNoRejectedImagesOnCreate,
  resolveListingStatus,
} from '../utils/propertyListingGuard.js';
import { buildPendingReviewSuccess } from '../utils/moderationMessages.js';

// Get all properties
export const getAllProperties = async (req, res) => {
  try {
    const properties = await propertyModel.getAll();
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await propertyModel.findById(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get 5 random related properties (excluding current)
    const relatedProperties = await propertyModel.getRandom(5, id);

    res.json({
      success: true,
      property,
      relatedProperties
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's own properties
export const getMyProperties = async (req, res) => {
  try {
    const properties = await propertyModel.findByOwnerId(req.user.id);
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get properties by type
export const getPropertiesByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!VALID_PROPERTY_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    const properties =
      type === 'plot'
        ? await propertyModel.findByPlotTypes()
        : await propertyModel.findByType(type);
    res.json({ success: true, properties, type });
  } catch (error) {
    console.error('Get properties by type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Search properties
export const searchProperties = async (req, res) => {
  try {
    const filters = {
      location: req.query.location,
      type: req.query.type,
      bhk: req.query.bhk,
      katha: req.query.katha,
      other_type: req.query.other_type,
      shop_sqft_range: req.query.shop_sqft_range,
      city: req.query.city,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice
    };

    const properties = await propertyModel.search(filters);

    if (req.user?.role === 'buyer') {
      const source = req.query.source === 'chatbot' ? 'chatbot' : 'search_bar';
      import('../services/searchHistoryService.js')
        .then(({ logSearchHistory }) => logSearchHistory(req.user.id, filters, source))
        .catch((err) => console.error('Search history log error:', err.message));
    }

    res.json({ success: true, properties, filters });
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new property
export const addProperty = async (req, res) => {
  try {
    const {
      title, description, price, type, bhk, katha, location, city,
      district: districtBody, state: stateBody, pincode, other_type, featured,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status, road_no
    } = req.body;

    // Validation (district / state / pincode optional — filled from city for search compatibility)
    if (!title || !description || !price || !type || !location || !city || road_no == null || String(road_no).trim() === '') {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const roadNoDb = parseRoadNo(road_no);
    if (roadNoDb == null) {
      return res.status(400).json({ error: 'Road no. must be a number from 1 to 999 (max 3 digits).' });
    }

    if (!VALID_PROPERTY_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    const kathaTrimmed = katha != null && String(katha).trim() !== '' ? String(katha).trim() : null;
    const otherTrim = String(other_type || '').trim();
    const shopSqftTrim = shop_sqft_range != null ? String(shop_sqft_range).trim() : '';
    const shopSqftForDb =
      (type === 'rent' || type === 'buy') && otherTrim === 'Shop' && SHOP_SQFT_RANGE_VALUES.includes(shopSqftTrim)
        ? shopSqftTrim
        : null;

    // Validate type-specific fields
    const fieldErrors = validatePropertyFields(type, {
      bhk,
      katha: kathaTrimmed,
      other_type,
      shop_sqft_range: shopSqftTrim
    });
    if (fieldErrors.length > 0) {
      return res.status(400).json({ error: fieldErrors.join(', ') });
    }

    assertListingTextAllowed(req.body);

    let imageUrls = [];
    let needsReview = false;
    if (req.files && req.files.length > 0) {
      const processed = await processPropertyImagesForUpload(req.files);
      assertNoRejectedImagesOnCreate(processed.rejected);
      needsReview = processed.needsReview;
      imageUrls = await uploadProcessedFilesToS3(processed.files);
    }

    const listingStatus = resolveListingStatus(needsReview);

    const loc = normalizeListingLocation(city);
    const district =
      districtBody != null && String(districtBody).trim() !== ''
        ? String(districtBody).trim()
        : loc.district;
    const state =
      stateBody != null && String(stateBody).trim() !== ''
        ? String(stateBody).trim()
        : loc.state;
    const pinFinal =
      pincode != null && String(pincode).trim() !== '' ? String(pincode).trim() : loc.pincode;

    const balconiesN = parseOptionalInt(balconies);
    const bathroomsN = parseOptionalInt(bathrooms);
    const gardenN = parseBool01(garden, 0);
    const carParkingN = parseBool01(car_parking, 0);
    const bikeParkingN = parseBool01(bike_parking, 0);
    const floorNo =
      floor_no != null && String(floor_no).trim() !== '' ? String(floor_no).trim() : null;

    const isShopListing = (type === 'rent' || type === 'buy') && otherTrim === 'Shop';
    const shopRoadDb = isShopListing ? (String(shop_road_distance ?? '').trim() || null) : null;
    let shopTokenDb = null;
    if (isShopListing && shop_token_amount != null && String(shop_token_amount).trim() !== '') {
      const tn = parseFloat(String(shop_token_amount).trim());
      shopTokenDb = Number.isFinite(tn) ? tn : null;
    }

    const balconiesFinal = isShopListing ? null : balconiesN;
    const bathroomsFinal = isShopListing ? null : bathroomsN;
    const gardenFinal = isShopListing ? 0 : gardenN;
    const floorNoFinal = isShopListing ? null : floorNo;

    const furnishDb = parseFurnishingForDb(type, otherTrim, furnishing_status);

    // Create property
    const propertyId = await propertyModel.create({
      title,
      description,
      price: parseFloat(price),
      type,
      bhk: otherTrim === 'Shop' ? null : bhk || null,
      katha: kathaTrimmed,
      balconies: balconiesFinal,
      bathrooms: bathroomsFinal,
      garden: gardenFinal,
      car_parking: carParkingN,
      floor_no: floorNoFinal,
      bike_parking: bikeParkingN,
      shop_sqft_range: shopSqftForDb,
      shop_road_distance: shopRoadDb,
      shop_token_amount: shopTokenDb,
      furnishing_status: furnishDb,
      location,
      road_no: roadNoDb,
      city,
      district,
      state,
      pincode: pinFinal,
      image_url: stringifyImageUrls(imageUrls),
      other_type: other_type || null,
      owner_id: req.user.id,
      featured: featured === 'true' ? 1 : 0,
      listing_status: listingStatus,
    });

    if (listingStatus === 'pending_review') {
      return res.status(201).json({
        ...buildPendingReviewSuccess(),
        propertyId,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Property added successfully',
      propertyId
    });

    if (listingStatus === 'active') {
      import('../services/propertyMatchService.js')
        .then(({ notifyMatchingBuyers }) => notifyMatchingBuyers(propertyId))
        .catch((err) => console.error('Property match notification error:', err.message));
    }
  } catch (error) {
    console.error('Add property error:', error);
    if (error.payload) {
      return res.status(error.status || 400).json(error.payload);
    }
    const status = error.status || (error.message?.includes('upload') ? 400 : 500);
    res.status(status).json({ error: error.message || 'Server error' });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, price, type, bhk, katha, location, city,
      district, state, pincode, other_type, featured, removeAllImages, removeImages,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status, road_no
    } = req.body;

    // Check if property exists and user owns it
    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own properties' });
    }

    assertListingTextAllowed({
      title: title || property.title,
      description: description || property.description,
      location: location || property.location,
      city: city || property.city,
      district: district ?? property.district,
      state: state ?? property.state,
      pincode: pincode ?? property.pincode,
      other_type: other_type ?? property.other_type,
      floor_no: floor_no ?? property.floor_no,
      shop_road_distance: shop_road_distance ?? property.shop_road_distance,
      katha: katha ?? property.katha,
      furnishing_status: furnishing_status ?? property.furnishing_status,
    });

    // Handle images (moderate + watermark new uploads, then delete removed from S3)
    let existingImages;
    let imageNeedsReview = false;
    try {
      const resolved = await resolvePropertyImageUrls({
        existingImages: parseImageUrls(property.image_url),
        reqFiles: req.files,
        removeAllImages,
        removeImages,
      });
      existingImages = resolved.images;
      imageNeedsReview = resolved.needsReview;
    } catch (error) {
      if (error.payload) {
        return res.status(error.status || 400).json(error.payload);
      }
      return res.status(error.status || 400).json({ error: error.message || 'Image upload failed' });
    }

    const nextType = type || property.type;
    if (type && !VALID_PROPERTY_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }
    const nextBhk =
      bhk !== undefined ? (String(bhk).trim() === '' ? null : bhk) : property.bhk;
    const nextKatha =
      katha !== undefined
        ? String(katha).trim() === ''
          ? null
          : String(katha).trim()
        : property.katha;
    const nextOther =
      other_type !== undefined
        ? String(other_type).trim() === ''
          ? null
          : other_type
        : property.other_type;
    const effectiveOther = String(nextOther ?? '').trim();
    const mergedShop = mergeShopSqftRange(shop_sqft_range, property.shop_sqft_range);
    const nextShopSqft =
      (nextType === 'rent' || nextType === 'buy') &&
      effectiveOther === 'Shop' &&
      SHOP_SQFT_RANGE_VALUES.includes(String(mergedShop || '').trim())
        ? String(mergedShop).trim()
        : null;

    const fieldErrors = validatePropertyFields(nextType, {
      bhk: effectiveOther === 'Shop' ? null : nextBhk,
      katha: nextKatha,
      other_type: nextOther,
      shop_sqft_range: effectiveOther === 'Shop' ? String(mergedShop || '').trim() : ''
    });
    if (fieldErrors.length > 0) {
      return res.status(400).json({ error: fieldErrors.join(', ') });
    }

    const nextCity = (city && String(city).trim()) || property.city;
    const loc = normalizeListingLocation(nextCity);
    const nextDistrict =
      district !== undefined && String(district).trim() !== ''
        ? String(district).trim()
        : property.district || loc.district;
    const nextState =
      state !== undefined && String(state).trim() !== ''
        ? String(state).trim()
        : property.state || loc.state;
    const nextPincode =
      pincode !== undefined && String(pincode).trim() !== ''
        ? String(pincode).trim()
        : property.pincode != null
          ? String(property.pincode)
          : loc.pincode;

    const nextBalconies = mergeOptionalInt(balconies, property.balconies);
    const nextBathrooms = mergeOptionalInt(bathrooms, property.bathrooms);
    const nextGarden = mergeBool01(garden, property.garden);
    const nextCarParking = mergeBool01(car_parking, property.car_parking);
    const nextBikeParking = mergeBool01(bike_parking, property.bike_parking);
    const nextFloorNo = mergeFloorNo(floor_no, property.floor_no);
    const nextBhkDb = effectiveOther === 'Shop' ? null : nextBhk;

    const isShopListing =
      (nextType === 'rent' || nextType === 'buy') && effectiveOther === 'Shop';
    const nextShopRoad = isShopListing
      ? mergeShopRoadDistance(shop_road_distance, property.shop_road_distance)
      : null;
    const nextShopToken = isShopListing
      ? mergeShopTokenAmount(shop_token_amount, property.shop_token_amount)
      : null;

    const balconiesDb = isShopListing ? null : nextBalconies;
    const bathroomsDb = isShopListing ? null : nextBathrooms;
    const gardenDb = isShopListing ? 0 : nextGarden;
    const floorNoDb = isShopListing ? null : nextFloorNo;

    const mergedFurnish = mergeFurnishingStatus(furnishing_status, property.furnishing_status);
    const nextFurnishing = parseFurnishingForDb(nextType, effectiveOther, mergedFurnish);

    const nextRoadNo = mergeRoadNo(road_no, property.road_no);
    if (road_no !== undefined && parseRoadNo(road_no) == null && String(road_no).trim() !== '') {
      return res.status(400).json({ error: 'Road no. must be a number from 1 to 999 (max 3 digits).' });
    }

    const nextListingStatus =
      imageNeedsReview ? 'pending_review' : property.listing_status || 'active';

    // Update property
    await propertyModel.update(id, {
      title: title || property.title,
      description: description || property.description,
      price: price ? parseFloat(price) : property.price,
      type: nextType,
      bhk: nextBhkDb,
      katha: nextKatha,
      balconies: balconiesDb,
      bathrooms: bathroomsDb,
      garden: gardenDb,
      car_parking: nextCarParking,
      floor_no: floorNoDb,
      bike_parking: nextBikeParking,
      shop_sqft_range: nextShopSqft,
      shop_road_distance: nextShopRoad,
      shop_token_amount: nextShopToken,
      furnishing_status: nextFurnishing,
      location: location || property.location,
      road_no: nextRoadNo,
      city: city || property.city,
      district: nextDistrict,
      state: nextState,
      pincode: nextPincode,
      image_url: stringifyImageUrls(existingImages),
      other_type: nextOther,
      featured: featured !== undefined ? (featured === 'true' ? 1 : 0) : property.featured,
      owner_id: property.owner_id,
      listing_status: nextListingStatus,
    });

    if (nextListingStatus === 'pending_review') {
      return res.json(buildPendingReviewSuccess());
    }

    res.json({
      success: true,
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('Update property error:', error);
    if (error.payload) {
      return res.status(error.status || 400).json(error.payload);
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check ownership (only owner or admin can delete)
    if (property.owner_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own properties' });
    }

    // Delete associated images from S3
    const images = parseImageUrls(property.image_url);
    await deleteAllPropertyImages(images);

    // Delete property from database
    await propertyModel.delete(id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
