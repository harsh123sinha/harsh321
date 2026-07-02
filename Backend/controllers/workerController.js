import { workerModel } from '../models/workerModel.js';
import {
  serviceDetailModel,
  enrichWorkerWithServiceDetails,
  enrichWorkersWithServiceDetails,
  hasServiceImage,
} from '../models/serviceDetailModel.js';
import { userModel } from '../models/userModel.js';
import { uploadImageToS3, deleteImageFromS3 } from '../utils/s3.js';
import { compressImageForStorage } from '../utils/imagePrep.js';
import {
  isValidWorkerProfession,
  isValidOffDay,
  isValidPriceType,
  getProfessionsByCategoryId,
  findCategoryIdByProfession,
  WORKER_PROFESSION_CATEGORIES,
  RENTAL_VEHICLE_FILTERS,
} from '../utils/workerProfessions.js';
import {
  getProfileType,
  shouldShowProfilePricing,
  shouldShowStandardIdDocs,
  isValidListingPriceType,
  isValidVehicleType,
  isValidRentalMode,
  isValidDriverFuelOption,
} from '../utils/workerProfileTypes.js';
import { formatEmployeeId } from '../utils/employeeId.js';
import { workerCustomerReviewModel } from '../models/workerCustomerReviewModel.js';
import {
  resolveBuildingMaterial,
} from '../utils/buildingMaterials.js';
import { isValidIndianMobile } from '../utils/helpers.js';

function getFile(req, field) {
  if (!req.files) return null;
  const f = req.files[field];
  if (Array.isArray(f)) return f[0] || null;
  return f || null;
}

function getListingUploadFiles(req) {
  const batch = req.files?.listing_images;
  const single = req.files?.listing_image;
  const fromBatch = Array.isArray(batch) ? batch : batch ? [batch] : [];
  const fromSingle = Array.isArray(single) ? single : single ? [single] : [];
  return [...fromBatch, ...fromSingle].slice(0, 4);
}

function parseKeepImageUrls(body) {
  try {
    const raw = body.keep_image_urls;
    if (!raw) return [];
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr.filter(Boolean).slice(0, 4) : [];
  } catch {
    return [];
  }
}

async function uploadListingImages(files) {
  const urls = [];
  for (const file of files.slice(0, 4)) {
    urls.push(await uploadWorkerImage(file, 'services/listings/'));
  }
  return urls;
}

async function deleteListingImageUrls(urls = []) {
  for (const url of urls) {
    if (url) await deleteImageFromS3(url);
  }
}

function parseImageUrlsFromRow(row) {
  if (row?.image_urls) {
    try {
      const parsed = typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls;
      if (Array.isArray(parsed) && parsed.length) return [...new Set(parsed.filter(Boolean))];
    } catch {
      /* fall through */
    }
  }
  return row?.image_url ? [row.image_url] : [];
}

/** Public catalogue — hide employee personal phone; include employee_id for inquiries */
function toPublicVendor(worker) {
  const employee_id = worker.employee_id || formatEmployeeId(worker.id);
  const { phone_number, email, user_name, ...rest } = worker;
  return {
    ...rest,
    employee_id,
    category_id: findCategoryIdByProfession(worker.profession),
    harsh_rating_avg: worker.harsh_rating_avg != null ? Number(worker.harsh_rating_avg) : null,
    customer_rating_avg: worker.customer_rating_avg != null ? Number(worker.customer_rating_avg) : null,
    customer_review_count: Number(worker.customer_review_count || 0),
    reviews: (worker.reviews || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      customerName: r.customer_name,
      createdAt: r.created_at,
    })),
  };
}

async function uploadWorkerImage(file, folder = 'services/') {
  const compressed = await compressImageForStorage(file.buffer);
  return uploadImageToS3(compressed, file.originalname, 'image/jpeg', folder);
}

async function saveServiceImage(workerId, detailType, file, s3Folder) {
  const existing = await serviceDetailModel.findActiveProfileImage(workerId, detailType);
  const url = await uploadWorkerImage(file, s3Folder);
  if (existing?.image_url) await deleteImageFromS3(existing.image_url);
  await serviceDetailModel.upsertProfileImage(workerId, detailType, url);
  return url;
}

function parseBool(value) {
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return null;
}

function getWorkerListingKind(worker) {
  const categoryId = findCategoryIdByProfession(worker.profession);
  if (categoryId === 'rental-vehicle') return 'vehicle';
  if (categoryId === 'building-material') return 'material';
  return null;
}

function parseListingBody(body, listingKind) {
  const errors = [];
  const rate = parseFloat(body.rate_amount);
  const priceType = String(body.price_type || (listingKind === 'material' ? 'per_unit' : 'daily')).trim().toLowerCase();

  if (!Number.isFinite(rate) || rate <= 0) errors.push('Cost must be greater than 0.');
  if (!isValidListingPriceType(priceType)) errors.push('Invalid price type.');

  if (listingKind === 'vehicle') {
    const vehicleType = String(body.vehicle_type || '').trim().toLowerCase();
    const rentalMode = String(body.rental_mode || '').trim().toLowerCase();
    const driverFuelOption =
      rentalMode === 'with_driver'
        ? String(body.driver_fuel_option || 'with_fuel').trim().toLowerCase()
        : null;
    const modelYear = parseInt(body.model_year, 10);
    const companyName = String(body.company_name || '').trim();
    const modelName = String(body.model_name || '').trim();

    if (!isValidVehicleType(vehicleType)) errors.push('Select car or bike.');
    if (!isValidRentalMode(rentalMode)) errors.push('Select self drive or with driver.');
    if (rentalMode === 'with_driver' && !isValidDriverFuelOption(driverFuelOption)) {
      errors.push('Select driver + vehicle + fuel or driver + vehicle only.');
    }
    if (!Number.isFinite(modelYear) || modelYear < 1990 || modelYear > new Date().getFullYear() + 1) {
      errors.push('Valid model year is required.');
    }
    if (!companyName) errors.push('Company name is required (e.g. Maruti Suzuki).');
    if (!modelName) errors.push('Model name is required (e.g. Zen).');

    let includedKm = null;
    let extraKmRate = null;
    let fuelCostPerKm = null;

    if (rentalMode === 'self_drive') {
      includedKm = body.included_km != null && body.included_km !== '' ? parseInt(body.included_km, 10) : 200;
      const extraKmRaw = body.extra_km_rate;
      extraKmRate = extraKmRaw != null && extraKmRaw !== '' ? parseFloat(extraKmRaw) : NaN;
      if (!Number.isFinite(includedKm) || includedKm < 0) errors.push('Included km must be 0 or more.');
      if (!Number.isFinite(extraKmRate) || extraKmRate < 0) {
        errors.push('Extra km rate is required (e.g. enter 12 for ₹12 per km after included limit).');
      }
    } else if (driverFuelOption === 'with_fuel') {
      includedKm = body.included_km != null && body.included_km !== '' ? parseInt(body.included_km, 10) : NaN;
      const extraKmRaw = body.extra_km_rate;
      extraKmRate = extraKmRaw != null && extraKmRaw !== '' ? parseFloat(extraKmRaw) : NaN;
      if (!Number.isFinite(includedKm) || includedKm < 0) {
        errors.push('Included km is required under the package cost.');
      }
      if (!Number.isFinite(extraKmRate) || extraKmRate < 0) {
        errors.push('Extra km rate after included km is required.');
      }
    } else {
      const fuelRaw = body.fuel_cost_per_km;
      fuelCostPerKm = fuelRaw != null && fuelRaw !== '' ? parseFloat(fuelRaw) : NaN;
      if (!Number.isFinite(fuelCostPerKm) || fuelCostPerKm < 0) {
        errors.push('Fuel cost per km is required (e.g. enter ₹ per km for fuel).');
      }
    }

    return {
      errors,
      data: {
        listing_kind: 'vehicle',
        vehicle_type: vehicleType,
        rental_mode: rentalMode,
        driver_fuel_option: driverFuelOption,
        model_year: modelYear,
        company_name: companyName,
        model_name: modelName,
        rate_amount: rate,
        price_type: priceType,
        included_km: includedKm,
        extra_km_rate: extraKmRate,
        fuel_cost_per_km: fuelCostPerKm,
        description: String(body.description || '').trim() || null,
        title: null,
        material_type: null,
      },
    };
  }

  const materialInput = String(body.material_type || body.title || '').trim();
  const material = resolveBuildingMaterial(materialInput);
  if (!material) {
    errors.push('Select a valid material type (Balu, Gitti, Brick, or Cement).');
  }

  const materialPriceType = material?.price_type || priceType;
  if (material && !isValidListingPriceType(materialPriceType)) {
    errors.push('Invalid material price type.');
  }

  return {
    errors,
    data: {
      listing_kind: 'material',
      material_type: material?.label || materialInput,
      title: material?.label || materialInput,
      rate_amount: rate,
      price_type: materialPriceType,
      description: String(body.description || '').trim() || null,
      vehicle_type: null,
      rental_mode: null,
      model_year: null,
      company_name: null,
      model_name: null,
      included_km: null,
      extra_km_rate: null,
      driver_fuel_option: null,
      fuel_cost_per_km: null,
    },
  };
}

function parseRequiredBody(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone_number = String(body.phone_number || '').trim();
  const profession = String(body.profession || '').trim();
  const description = String(body.description || '').trim();
  const categoryId = String(body.category_id || findCategoryIdByProfession(profession)).trim();
  const profileType = getProfileType(profession, categoryId);

  const errors = [];
  if (!name) errors.push('Name is required.');
  if (!email) errors.push('Email is required.');
  if (!isValidIndianMobile(phone_number)) errors.push('Valid mobile number is required.');
  if (!isValidWorkerProfession(profession)) errors.push('Please select a valid profession.');
  if (!description) errors.push('Description is required.');

  const data = {
    name,
    email,
    phone_number,
    profession,
    description,
    profile_type: profileType,
    working_hours_per_day: null,
    off_day: null,
    price_type: null,
    price_amount: null,
    area_sqft: null,
    outside_caterers_allowed: null,
    catering_type: null,
    hall_booking_cost: null,
    veg_platter_cost: null,
    nonveg_platter_cost: null,
  };

  if (profileType === 'marriage_hall') {
    const area = parseFloat(body.area_sqft);
    const hallCost = parseFloat(body.hall_booking_cost);
    const vegPlatter = parseFloat(body.veg_platter_cost);
    const nonvegPlatter = parseFloat(body.nonveg_platter_cost);
    const outside = parseBool(body.outside_caterers_allowed);

    if (!Number.isFinite(area) || area <= 0) errors.push('Hall area in sq ft is required.');
    if (outside === null) errors.push('Please specify if outside caterers are allowed.');
    if (!Number.isFinite(hallCost) || hallCost <= 0) errors.push('Hall booking cost is required.');
    const hasVeg = Number.isFinite(vegPlatter) && vegPlatter > 0;
    const hasNonveg = Number.isFinite(nonvegPlatter) && nonvegPlatter > 0;
    if (!hasVeg && !hasNonveg) {
      errors.push('Enter veg platter cost and/or non-veg platter cost (per plate).');
    }

    let catering = 'both';
    if (hasVeg && !hasNonveg) catering = 'veg';
    else if (hasNonveg && !hasVeg) catering = 'nonveg';

    data.area_sqft = area;
    data.outside_caterers_allowed = outside;
    data.catering_type = catering;
    data.hall_booking_cost = hallCost;
    data.veg_platter_cost = hasVeg ? vegPlatter : null;
    data.nonveg_platter_cost = hasNonveg ? nonvegPlatter : null;
  } else if (profileType !== 'listing_vendor') {
    const off_day = String(body.off_day || '').trim();
    const hours = parseFloat(body.working_hours_per_day);

    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      errors.push('Working hours per day must be between 0.5 and 24.');
    }
    if (!isValidOffDay(off_day)) errors.push('Please select a valid off day.');
    data.working_hours_per_day = hours;
    data.off_day = off_day;

    if (shouldShowProfilePricing(profession, categoryId)) {
      const priceType = String(body.price_type || 'daily').trim().toLowerCase();
      const priceRaw = body.price_amount ?? body.price_per_day;
      const price = parseFloat(priceRaw);
      if (!isValidPriceType(priceType)) errors.push('Please select daily or monthly pricing.');
      if (!Number.isFinite(price) || price <= 0) {
        errors.push(
          priceType === 'monthly' ? 'Monthly price must be greater than 0.' : 'Daily price must be greater than 0.'
        );
      }
      data.price_type = priceType;
      data.price_amount = price;
    }
  }

  return { errors, data, profileType, categoryId };
}

export const getMyWorkerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Worker access only' });
    }

    const user = await userModel.findById(req.user.id);
    let worker = await workerModel.findByUserId(req.user.id);
    if (worker) {
      await workerModel.ensureEmployeeId(worker.id);
      worker = await enrichWorkerWithServiceDetails(await workerModel.findByUserId(req.user.id));
    }

    res.json({
      success: true,
      user,
      worker,
      listings: worker?.listings || [],
      service_details: worker?.service_details || [],
      profile_complete: Boolean(worker?.profile_complete),
      category_id: worker ? findCategoryIdByProfession(worker.profession) : '',
    });
  } catch (error) {
    console.error('getMyWorkerProfile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const upsertMyWorkerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Worker access only' });
    }

    const { errors, data, profileType, categoryId } = parseRequiredBody(req.body);
    if (errors.length) {
      return res.status(400).json({ error: errors[0], errors });
    }

    const existing = await workerModel.findByUserId(req.user.id);
    const workerPhoto = getFile(req, 'worker_photo');
    const aadharPhoto = getFile(req, 'aadhar_image');
    const hallPhoto = getFile(req, 'hall_photo');
    const workerIdForCheck = existing?.id;

    if (profileType === 'marriage_hall') {
      if (!hallPhoto && !(workerIdForCheck && (await hasServiceImage(workerIdForCheck, 'hall_photo')))) {
        return res.status(400).json({ error: 'Marriage hall / garden image is required.' });
      }
    } else if (profileType === 'listing_vendor') {
      if (!workerPhoto && !(workerIdForCheck && (await hasServiceImage(workerIdForCheck, 'profile_photo')))) {
        return res.status(400).json({ error: 'Business / profile photo is required.' });
      }
    } else if (shouldShowStandardIdDocs(data.profession, categoryId)) {
      if (!workerPhoto && !(workerIdForCheck && (await hasServiceImage(workerIdForCheck, 'profile_photo')))) {
        return res.status(400).json({ error: 'Employee photo is required.' });
      }
      if (!aadharPhoto && !(workerIdForCheck && (await hasServiceImage(workerIdForCheck, 'aadhar')))) {
        return res.status(400).json({ error: 'Aadhar card image is required.' });
      }
    }

    const payload = {
      user_id: req.user.id,
      ...data,
      profile_complete: true,
    };

    if (existing) {
      await workerModel.updateByUserId(req.user.id, payload);
    } else {
      await workerModel.create(payload);
    }

    const worker = await workerModel.findByUserId(req.user.id);
    await workerModel.ensureEmployeeId(worker.id);

    if (workerPhoto) {
      await saveServiceImage(worker.id, 'profile_photo', workerPhoto, 'services/profile/');
    }
    if (aadharPhoto) {
      await saveServiceImage(worker.id, 'aadhar', aadharPhoto, 'services/aadhar/');
    }
    if (hallPhoto) {
      await saveServiceImage(worker.id, 'hall_photo', hallPhoto, 'services/halls/');
    }

    await userModel.update(req.user.id, {
      name: data.name,
      email: data.email,
      role: 'worker',
      phone_number: data.phone_number,
    });

    const enriched = await enrichWorkerWithServiceDetails(await workerModel.findByUserId(req.user.id));
    const user = await userModel.findById(req.user.id);

    res.json({
      success: true,
      message: 'Profile saved successfully',
      user,
      worker: enriched,
      listings: enriched?.listings || [],
      service_details: enriched?.service_details || [],
      profile_complete: true,
      category_id: findCategoryIdByProfession(enriched.profession),
    });
  } catch (error) {
    console.error('upsertMyWorkerProfile:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getMyListings = async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ error: 'Worker access only' });
    const worker = await workerModel.findByUserId(req.user.id);
    if (!worker || worker.profile_type !== 'listing_vendor') {
      return res.status(400).json({ error: 'Listings are only for rental and material suppliers.' });
    }
    const listings = await serviceDetailModel.getListingsForWorker(worker.id);
    res.json({ success: true, listings, service_details: await serviceDetailModel.findByWorkerId(worker.id) });
  } catch (error) {
    console.error('getMyListings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createMyListing = async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ error: 'Worker access only' });
    const worker = await workerModel.findByUserId(req.user.id);
    if (!worker?.profile_complete || worker.profile_type !== 'listing_vendor') {
      return res.status(400).json({ error: 'Complete your supplier/rental profile first.' });
    }

    const listingKind = getWorkerListingKind(worker);
    if (!listingKind) {
      return res.status(400).json({ error: 'Listings are only for rental and material suppliers.' });
    }

    const { errors, data } = parseListingBody(req.body, listingKind);
    if (errors.length) return res.status(400).json({ error: errors[0] });

    const uploadFiles = getListingUploadFiles(req);
    if (!uploadFiles.length) return res.status(400).json({ error: 'At least one image is required.' });
    if (uploadFiles.length > 4) return res.status(400).json({ error: 'Up to 4 images allowed.' });

    const imageUrls = await uploadListingImages(uploadFiles);
    const id = await serviceDetailModel.createListing({
      worker_id: worker.id,
      image_url: imageUrls[0],
      image_urls: imageUrls,
      ...data,
    });

    const listing = serviceDetailModel.mapListingRow(await serviceDetailModel.findById(id));
    res.status(201).json({ success: true, listing });
  } catch (error) {
    console.error('createMyListing:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const updateMyListing = async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ error: 'Worker access only' });
    const worker = await workerModel.findByUserId(req.user.id);
    if (!worker?.profile_complete || worker.profile_type !== 'listing_vendor') {
      return res.status(400).json({ error: 'Complete your supplier/rental profile first.' });
    }

    const listing = await serviceDetailModel.findById(req.params.id);
    if (!listing || listing.worker_id !== worker.id || listing.detail_type !== 'listing') {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listingKind = getWorkerListingKind(worker);
    if (!listingKind) return res.status(400).json({ error: 'Invalid vendor type.' });

    const { errors, data } = parseListingBody(req.body, listingKind);
    if (errors.length) return res.status(400).json({ error: errors[0] });

    const keptUrls = parseKeepImageUrls(req.body);
    const uploadFiles = getListingUploadFiles(req);
    const previousUrls = parseImageUrlsFromRow(listing);
    let nextUrls = [...keptUrls, ...(await uploadListingImages(uploadFiles))].slice(0, 4);

    if (!nextUrls.length) nextUrls = previousUrls;
    if (!nextUrls.length) return res.status(400).json({ error: 'At least one image is required.' });
    if (nextUrls.length > 4) return res.status(400).json({ error: 'Up to 4 images allowed.' });

    const removed = previousUrls.filter((url) => !nextUrls.includes(url));
    await deleteListingImageUrls(removed);

    await serviceDetailModel.updateListing(listing.id, worker.id, {
      ...data,
      image_url: nextUrls[0],
      image_urls: nextUrls,
    });

    const updated = serviceDetailModel.mapListingRow(await serviceDetailModel.findById(listing.id));
    res.json({ success: true, listing: updated });
  } catch (error) {
    console.error('updateMyListing:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const deleteMyListing = async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ error: 'Worker access only' });
    const worker = await workerModel.findByUserId(req.user.id);
    if (!worker) return res.status(404).json({ error: 'Profile not found' });

    const listing = await serviceDetailModel.findById(req.params.id);
    if (!listing || listing.worker_id !== worker.id || listing.detail_type !== 'listing') {
      return res.status(404).json({ error: 'Listing not found' });
    }
    const allUrls = parseImageUrlsFromRow(listing);
    await deleteListingImageUrls(allUrls);
    await serviceDetailModel.deleteById(listing.id, worker.id);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteMyListing:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPublicVendorById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid vendor id' });
    }

    const worker = await workerModel.findById(id);
    if (!worker || !worker.profile_complete) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const [enriched] = await enrichWorkersWithServiceDetails([worker]);
    const reviews = await workerCustomerReviewModel.findByWorkerIds([id]);
    const vendor = toPublicVendor({
      ...enriched,
      reviews: reviews.filter((r) => r.worker_id === id),
    });

    res.json({ success: true, vendor });
  } catch (error) {
    console.error('getPublicVendorById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const browsePublicVendors = async (req, res) => {
  try {
    const categoryId = String(req.query.categoryId || '').trim();
    const profession = String(req.query.profession || '').trim();
    const q = String(req.query.q || '').trim();

    let professions = [];
    if (profession) {
      professions = [profession];
    } else if (categoryId) {
      professions = getProfessionsByCategoryId(categoryId);
      if (categoryId === 'rental-vehicle') {
        professions = [
          ...new Set([...professions, ...RENTAL_VEHICLE_FILTERS.map((f) => f.label)]),
        ];
      }
    }

    const workers = await workerModel.searchPublic({ professions, q });
    const enriched = await enrichWorkersWithServiceDetails(workers);
    const workerIds = enriched.map((w) => w.id);
    const allReviews = await workerCustomerReviewModel.findByWorkerIds(workerIds);
    const reviewsByWorker = new Map();
    for (const r of allReviews) {
      if (!reviewsByWorker.has(r.worker_id)) reviewsByWorker.set(r.worker_id, []);
      reviewsByWorker.get(r.worker_id).push(r);
    }
    const vendors = enriched.map((w) => ({
      ...w,
      reviews: reviewsByWorker.get(w.id) || [],
    }));

    res.json({
      success: true,
      vendors: vendors.map((w) => toPublicVendor(w)),
      categories: WORKER_PROFESSION_CATEGORIES,
    });
  } catch (error) {
    console.error('browsePublicVendors:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
