import { propertyModel } from '../models/propertyModel.js';
import { normEmail } from '../middleware/auth.js';
import { parseImageUrls, stringifyImageUrls, validatePropertyFields } from '../utils/helpers.js';
import { VALID_PROPERTY_TYPES, SHOP_SQFT_RANGE_VALUES, parseFurnishingForDb, PLOT_TYPES, isShopLikeOtherType, parsePriceUnitForDb } from '../utils/propertyConstants.js';
import { normalizeListingLocation } from '../utils/listingLocation.js';
import { getRecommendations, parseRecommendationQuery } from '../services/recommendationService.js';
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
  uploadPdfToS3,
  deleteImageFromS3,
} from '../utils/s3.js';
import {
  assertListingTextAllowed,
  processPropertyImagesForUpload,
  assertNoRejectedImagesOnCreate,
  resolveListingStatus,
  getProseReviewFlag,
  buildReviewReasons,
} from '../utils/propertyListingGuard.js';
import { compressPdfForUpload } from '../utils/pdfPrep.js';
import { buildPendingReviewSuccess } from '../utils/moderationMessages.js';
import { moderatePropertyImage } from '../utils/moderation.js';

function getUploadedImages(req) {
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  return req.files.images || [];
}

function getUploadedProjectPdf(req) {
  if (!req.files || Array.isArray(req.files)) return null;
  const pdfs = req.files.project_pdf;
  return pdfs?.[0] || null;
}

// Get all properties
export const getAllProperties = async (req, res) => {
  try {
    const limit = req.query.limit;
    const properties = await propertyModel.getAll(limit);
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

    const relatedProperties = await getRecommendations({}, {
      basedOnPropertyId: id,
      limit: 8,
    });

    res.json({
      success: true,
      property,
      relatedProperties,
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
    const limit = req.query.limit;
    const offset = req.query.offset;

    if (!VALID_PROPERTY_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    const result =
      type === 'plot'
        ? await propertyModel.findByPlotTypes(limit, offset)
        : await propertyModel.findByType(type, limit, offset);
    res.json({
      success: true,
      properties: result.rows,
      total: result.total,
      type,
    });
  } catch (error) {
    console.error('Get properties by type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Smart recommendations from search filters or a reference property
export const getPropertyRecommendations = async (req, res) => {
  try {
    const { filters, limit, excludeIds, basedOnPropertyId } = parseRecommendationQuery(req.query);

    const properties = await getRecommendations(filters, {
      limit,
      excludeIds,
      basedOnPropertyId,
    });

    if (req.user?.role === 'buyer' && hasRecommendationSearchContext(filters)) {
      import('../services/searchHistoryService.js')
        .then(({ logSearchHistory }) =>
          logSearchHistory(req.user.id, {
            location: filters.location,
            city: filters.city,
            type: filters.type,
            bhk: filters.bhk,
            katha: filters.katha,
            other_type: filters.other_type,
            shop_sqft_range: filters.shop_sqft_range,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
          }, 'api')
        )
        .catch((err) => console.error('Recommendation search log error:', err.message));
    }

    res.json({
      success: true,
      properties,
      filters,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

function hasRecommendationSearchContext(filters) {
  return Boolean(
    filters.location ||
      filters.city ||
      filters.type ||
      filters.bhk != null ||
      filters.katha ||
      filters.other_type ||
      filters.minPrice != null ||
      filters.maxPrice != null
  );
}

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
      maxPrice: req.query.maxPrice,
      bathrooms: req.query.bathrooms,
      facing: req.query.facing,
      furnishing_status: req.query.furnishing_status,
      car_parking: req.query.car_parking,
      sort: req.query.sort,
      brokerId: req.query.brokerId,
      limit: req.query.limit,
      offset: req.query.offset,
    };

    const result = await propertyModel.search(filters);

    if (req.user?.role === 'buyer') {
      const source = req.query.source === 'chatbot' ? 'chatbot' : 'search_bar';
      import('../services/searchHistoryService.js')
        .then(({ logSearchHistory }) => logSearchHistory(req.user.id, filters, source))
        .catch((err) => console.error('Search history log error:', err.message));
    }

    res.json({ success: true, properties: result.rows, total: result.total, filters });
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new property or project
export const addProperty = async (req, res) => {
  try {
    const listingKind = req.body.listing_kind === 'project' ? 'project' : 'property';

    if (listingKind === 'project') {
      const {
        title,
        description,
        price,
        location,
        city,
        featured,
        project_type,
        developer_name,
        marketed_by,
        bhk_options,
        sqft_from,
        sqft_to,
        road_no,
      } = req.body;

      if (
        !title ||
        !description ||
        !price ||
        !location ||
        !city ||
        !project_type ||
        !developer_name ||
        !bhk_options
      ) {
        return res.status(400).json({ error: 'Required project fields missing' });
      }

      if (!['enclave', 'apartment'].includes(String(project_type))) {
        return res.status(400).json({ error: 'Invalid project type' });
      }

      assertListingTextAllowed(req.body);
      const proseReview = getProseReviewFlag(req.body);

      let imageUrls = [];
      let imageNeedsReview = false;
      const imageFiles = getUploadedImages(req);
      if (imageFiles.length > 0) {
        const processed = await processPropertyImagesForUpload(imageFiles);
        assertNoRejectedImagesOnCreate(processed.rejected);
        imageNeedsReview = processed.needsReview;
        imageUrls = await uploadProcessedFilesToS3(processed.files);
      } else {
        return res.status(400).json({ error: 'At least one project image is required' });
      }

      let enclavePdfUrl = null;
      const pdfFile = getUploadedProjectPdf(req);
      if (pdfFile) {
        const compressedPdf = await compressPdfForUpload(pdfFile.buffer);
        enclavePdfUrl = await uploadPdfToS3(compressedPdf, pdfFile.originalname);
      }

      const needsReview = imageNeedsReview || Boolean(proseReview);
      const listingStatus = resolveListingStatus(needsReview);
      const listingReviewReason = buildReviewReasons({ imageNeedsReview, proseReview });
      const loc = normalizeListingLocation(city);
      const roadNoDb = parseRoadNo(road_no) ?? 1;

      const propertyId = await propertyModel.create({
        title,
        description,
        price: parseFloat(price),
        type: 'buy',
        bhk: null,
        katha: null,
        balconies: null,
        bathrooms: null,
        garden: 0,
        car_parking: 0,
        floor_no: null,
        bike_parking: 0,
        shop_sqft_range: null,
        shop_road_distance: null,
        shop_token_amount: null,
        furnishing_status: null,
        location,
        road_no: roadNoDb,
        city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        image_url: stringifyImageUrls(imageUrls),
        other_type: project_type === 'enclave' ? 'Enclave' : 'Apartment',
        owner_id: req.user.id,
        featured: featured === 'true' ? 1 : 0,
        listing_status: listingStatus,
        listing_review_reason: listingReviewReason,
        listing_kind: 'project',
        project_type,
        developer_name: String(developer_name).trim(),
        marketed_by: marketed_by ? String(marketed_by).trim() : null,
        bhk_options: String(bhk_options).trim(),
        sqft_from: sqft_from || null,
        sqft_to: sqft_to || null,
        enclave_pdf_url: enclavePdfUrl,
      });

      if (listingStatus === 'pending_review') {
        return res.status(201).json({
          ...buildPendingReviewSuccess(),
          propertyId,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Project added successfully',
        propertyId,
      });
    }

    const {
      title, description, price, price_unit, type, bhk, katha, location, city,
      district: districtBody, state: stateBody, pincode, other_type, featured,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status, road_no, facing, built_up_area_sqft
    } = req.body;

    // Validation (district / state / pincode optional — filled from city for search compatibility)
    const isPlotListing = PLOT_TYPES.includes(type);
    if (!title || !description || !price || !type || !location || !city) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const roadNoDb =
      String(road_no ?? '').trim() === '' ? null : parseRoadNo(road_no);
    if (String(road_no ?? '').trim() !== '' && roadNoDb == null) {
      return res.status(400).json({ error: 'Road no. must be a number from 1 to 999 (max 3 digits).' });
    }

    if (!VALID_PROPERTY_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    const kathaTrimmed = katha != null && String(katha).trim() !== '' ? String(katha).trim() : null;
    const otherTrim = String(other_type || '').trim();
    const shopSqftTrim = shop_sqft_range != null ? String(shop_sqft_range).trim() : '';
    const shopSqftForDb =
      (type === 'rent' || type === 'buy') && isShopLikeOtherType(otherTrim) && SHOP_SQFT_RANGE_VALUES.includes(shopSqftTrim)
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
    const proseReview = getProseReviewFlag(req.body);

    let imageUrls = [];
    let imageNeedsReview = false;
    const imageFiles = getUploadedImages(req);
    if (imageFiles.length > 0) {
      const processed = await processPropertyImagesForUpload(imageFiles);
      assertNoRejectedImagesOnCreate(processed.rejected);
      imageNeedsReview = processed.needsReview;
      imageUrls = await uploadProcessedFilesToS3(processed.files);
    }

    const needsReview = imageNeedsReview || Boolean(proseReview);
    const listingStatus = resolveListingStatus(needsReview);
    const listingReviewReason = buildReviewReasons({ imageNeedsReview, proseReview });

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

    const isShopListing = (type === 'rent' || type === 'buy') && isShopLikeOtherType(otherTrim);
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
    const facingDb =
      facing != null && String(facing).trim() !== '' ? String(facing).trim().toUpperCase() : null;

    // Create property
    const propertyId = await propertyModel.create({
      title,
      description,
      price: parseFloat(price),
      price_unit: parsePriceUnitForDb(otherTrim, price_unit),
      type,
      bhk: isShopLikeOtherType(otherTrim) ? null : bhk || null,
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
      facing: facingDb,
      built_up_area_sqft: built_up_area_sqft,
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
      listing_review_reason: listingReviewReason,
      listing_kind: 'property',
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
      title, description, price, price_unit, type, bhk, katha, location, city,
      district, state, pincode, other_type, featured, removeAllImages, removeImages,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status, road_no, facing, built_up_area_sqft
    } = req.body;

    // Check if property exists and user owns it
    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own properties' });
    }

    const proseReview = getProseReviewFlag({
      title: title || property.title,
      description: description || property.description,
    });

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
        reqFiles: getUploadedImages(req),
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
      isShopLikeOtherType(effectiveOther) &&
      SHOP_SQFT_RANGE_VALUES.includes(String(mergedShop || '').trim())
        ? String(mergedShop).trim()
        : null;

    const fieldErrors = validatePropertyFields(nextType, {
      bhk: isShopLikeOtherType(effectiveOther) ? null : nextBhk,
      katha: nextKatha,
      other_type: nextOther,
      shop_sqft_range: isShopLikeOtherType(effectiveOther) ? String(mergedShop || '').trim() : ''
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
    const nextBhkDb = isShopLikeOtherType(effectiveOther) ? null : nextBhk;

    const isShopListing =
      (nextType === 'rent' || nextType === 'buy') && isShopLikeOtherType(effectiveOther);
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
    const nextFacing =
      facing !== undefined
        ? String(facing).trim() === ''
          ? null
          : String(facing).trim().toUpperCase()
        : property.facing;

    const nextRoadNo = mergeRoadNo(road_no, property.road_no);
    if (road_no !== undefined && parseRoadNo(road_no) == null && String(road_no).trim() !== '') {
      return res.status(400).json({ error: 'Road no. must be a number from 1 to 999 (max 3 digits).' });
    }

    const needsReview = imageNeedsReview || Boolean(proseReview);
    const nextListingStatus = needsReview
      ? 'pending_review'
      : property.listing_status || 'active';
    const listingReviewReason = needsReview
      ? buildReviewReasons({ imageNeedsReview, proseReview })
      : property.listing_review_reason;

    const nextBuiltUpArea =
      built_up_area_sqft !== undefined
        ? String(built_up_area_sqft).trim() === ''
          ? null
          : built_up_area_sqft
        : property.built_up_area_sqft;

    let nextEnclavePdfUrl = property.enclave_pdf_url;
    const pdfFile = getUploadedProjectPdf(req);
    if (pdfFile && property.listing_kind === 'project') {
      if (property.enclave_pdf_url) {
        await deleteImageFromS3(property.enclave_pdf_url);
      }
      const compressedPdf = await compressPdfForUpload(pdfFile.buffer);
      nextEnclavePdfUrl = await uploadPdfToS3(compressedPdf, pdfFile.originalname);
    }

    // Update property
    await propertyModel.update(id, {
      title: title || property.title,
      description: description || property.description,
      price: price ? parseFloat(price) : property.price,
      price_unit: parsePriceUnitForDb(effectiveOther, price_unit ?? property.price_unit),
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
      facing: nextFacing,
      built_up_area_sqft: nextBuiltUpArea,
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
      listing_review_reason: listingReviewReason,
      enclave_pdf_url: nextEnclavePdfUrl,
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

/** Check images before upload — returns per-file moderation result (no S3 save). */
export const previewModerateImages = async (req, res) => {
  try {
    const files = req.files?.length ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const results = [];
    for (const file of files) {
      const mod = await moderatePropertyImage(file.buffer, file.mimetype);
      results.push({
        filename: file.originalname,
        rejected: Boolean(mod.rejected),
        pending: Boolean(mod.pending),
        approved: Boolean(mod.approved),
        code: mod.code || null,
        userMessage: mod.userMessage || null,
        confidence: mod.confidence || 0,
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Preview moderate images error:', error);
    res.status(500).json({ error: 'Image check failed' });
  }
};
