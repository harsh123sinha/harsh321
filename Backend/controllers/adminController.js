import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';
import { propertyModel } from '../models/propertyModel.js';
import { subAdminModel } from '../models/subAdminModel.js';
import { verifyAdminCredentials } from '../middleware/auth.js';
import { parseImageUrls, stringifyImageUrls, validatePropertyFields, isValidIndianMobile } from '../utils/helpers.js';
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
  mergeFurnishingStatus
} from '../utils/propertyAmenities.js';
import {
  uploadAndModerateMulterFiles,
  resolvePropertyImageUrls,
  deleteAllPropertyImages,
  deleteImagesFromS3,
  buildPropertyRejectionMessage,
} from '../utils/s3.js';

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Verify admin credentials
    const isValid = await verifyAdminCredentials(email, password, bcrypt);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate admin JWT token
    const token = jwt.sign(
      { email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: { email }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAll();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create user (admin / sub-admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone_number } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const validRoles = ['owner', 'agent', 'buyer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Use owner, agent, or buyer.' });
    }

    if (phone_number && !isValidIndianMobile(String(phone_number))) {
      return res.status(400).json({ error: 'Invalid Indian mobile number (10 digits, starting 6–9)' });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number: phone_number || null
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone_number, password } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const phoneNorm =
      phone_number === undefined || phone_number === null || String(phone_number).trim() === ''
        ? null
        : String(phone_number).trim();

    if (phoneNorm && !isValidIndianMobile(phoneNorm)) {
      return res.status(400).json({ error: 'Invalid Indian mobile number (10 digits, starting 6–9)' });
    }

    // Check if email is being changed and already exists
    if (email !== user.email) {
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    await userModel.update(id, { name, email, role, phone_number: phoneNorm });

    if (password && String(password).trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.updatePasswordById(id, hashedPassword);
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's properties first (optional - or set owner_id to NULL)
    const userProperties = await propertyModel.findByOwnerId(id);
    for (const property of userProperties) {
      const images = parseImageUrls(property.image_url);
      await deleteAllPropertyImages(images);
      await propertyModel.delete(property.id);
    }

    await userModel.delete(id);

    res.json({
      success: true,
      message: 'User and associated properties deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all properties (admin view with filters)
export const adminGetAllProperties = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      type: req.query.type,
      bhk: req.query.bhk,
      katha: req.query.katha,
      other_type: req.query.other_type,
      shop_sqft_range: req.query.shop_sqft_range,
      location: req.query.location
    };

    const properties = await propertyModel.adminSearch(filters);
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Admin get properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create property on behalf of a user (admin / sub-admin)
export const adminCreateProperty = async (req, res) => {
  try {
    const {
      title, description, price, type, bhk, katha, location, city,
      district: districtBody, state: stateBody, pincode, other_type, featured, owner_id,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status
    } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: 'owner_id is required (listing owner user id)' });
    }

    const owner = await userModel.findById(owner_id);
    if (!owner) {
      return res.status(400).json({ error: 'Owner user not found' });
    }

    if (!title || !description || !price || !type || !location || !city) {
      return res.status(400).json({ error: 'Required fields missing' });
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

    const fieldErrors = validatePropertyFields(type, {
      bhk,
      katha: kathaTrimmed,
      other_type,
      shop_sqft_range: shopSqftTrim
    });
    if (fieldErrors.length > 0) {
      return res.status(400).json({ error: fieldErrors.join(', ') });
    }

    let imageUrls = [];
    let imageModeration = null;
    if (req.files && req.files.length > 0) {
      const uploadResult = await uploadAndModerateMulterFiles(req.files);
      imageUrls = uploadResult.urls;
      imageModeration = uploadResult.moderation;

      if (imageModeration?.rejected > 0) {
        await deleteImagesFromS3(imageUrls);
        return res.status(400).json({
          error:
            imageModeration.userMessage ||
            buildPropertyRejectionMessage(imageModeration, { action: 'add' }),
          imageModeration,
        });
      }
    }

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
      city,
      district,
      state,
      pincode: pinFinal,
      image_url: stringifyImageUrls(imageUrls),
      other_type: other_type || null,
      owner_id: parseInt(owner_id, 10),
      featured: featured === 'true' || featured === true ? 1 : 0
    });

    const successMessage = imageModeration?.rejectionMessage
      ? `Property created successfully. ${imageModeration.rejectionMessage}`
      : 'Property created successfully';

    res.status(201).json({
      success: true,
      message: successMessage,
      propertyId,
      ...(imageModeration && { imageModeration }),
    });
  } catch (error) {
    console.error('Admin create property error:', error);
    const status = error.status || (error.message?.includes('upload') ? 400 : 500);
    res.status(status).json({ error: error.message || 'Server error' });
  }
};

// Toggle property featured status
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await propertyModel.toggleFeatured(id, featured);

    res.json({
      success: true,
      message: `Property ${featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin update property
export const adminUpdateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, price, type, bhk, katha, location, city,
      district, state, pincode, other_type, featured, owner_id,
      removeAllImages, removeImages,
      balconies, bathrooms, garden, car_parking, floor_no, bike_parking, shop_sqft_range,
      shop_road_distance, shop_token_amount, furnishing_status
    } = req.body;

    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    let existingImages;
    let imageModeration = null;
    try {
      const imageResult = await resolvePropertyImageUrls({
        existingImages: parseImageUrls(property.image_url),
        reqFiles: req.files,
        removeAllImages,
        removeImages,
      });
      existingImages = imageResult.urls;
      imageModeration = imageResult.moderation;
    } catch (error) {
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
      shop_sqft_range: effectiveOther === 'Shop' ? String(mergedShop ?? '').trim() : ''
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
      city: city || property.city,
      district: nextDistrict,
      state: nextState,
      pincode: nextPincode,
      image_url: stringifyImageUrls(existingImages),
      other_type: nextOther,
      featured: featured !== undefined ? (featured === 'true' || featured === true ? 1 : 0) : property.featured,
      owner_id: owner_id || property.owner_id
    });

    const successMessage = imageModeration?.rejected > 0
      ? `Property updated. ${imageModeration.rejectionMessage || 'Some images were rejected.'}`
      : 'Property updated successfully';

    res.json({
      success: true,
      message: successMessage,
      ...(imageModeration?.rejected > 0 && {
        warning: imageModeration.userMessage,
      }),
      ...(imageModeration && { imageModeration }),
    });
  } catch (error) {
    console.error('Admin update property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin delete property
export const adminDeleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const images = parseImageUrls(property.image_url);
    await deleteAllPropertyImages(images);

    await propertyModel.delete(id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all sub-admins
export const getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await subAdminModel.getAll();
    res.json({ success: true, subAdmins });
  } catch (error) {
    console.error('Get sub-admins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create sub-admin
export const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if sub-admin already exists
    const existing = await subAdminModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Sub-admin with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const subAdminId = await subAdminModel.create({
      name,
      email,
      password, // Legacy plain password field
      hashed_password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      subAdminId
    });
  } catch (error) {
    console.error('Create sub-admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update sub-admin
export const updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const subAdmin = await subAdminModel.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ error: 'Sub-admin not found' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await subAdminModel.update(id, {
      name,
      email,
      hashed_password: hashedPassword
    });

    res.json({
      success: true,
      message: 'Sub-admin updated successfully'
    });
  } catch (error) {
    console.error('Update sub-admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete sub-admin
export const deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const subAdmin = await subAdminModel.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ error: 'Sub-admin not found' });
    }

    await subAdminModel.delete(id);

    res.json({
      success: true,
      message: 'Sub-admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete sub-admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
