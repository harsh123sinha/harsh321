import multer from 'multer';
import path from 'path';
import { PDF_MAX_UPLOAD_BYTES } from '../utils/pdfPrep.js';

const storage = multer.memoryStorage();

const IMAGE_MAX_BYTES = 15 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpe?g|png|webp)$/i;
  const allowedMimes = /^image\/(jpeg|png|webp)$/i;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }

  const err = new Error('Only image files are allowed (jpeg, jpg, png, webp)');
  err.status = 400;
  cb(err);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export const uploadMultipleImages = upload.array('images', 10);
export const uploadSingleImage = upload.single('photo');

const pdfFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    /\.pdf$/i.test(path.extname(file.originalname || ''));
  if (isPdf) return cb(null, true);
  const err = new Error('Project PDF must be a .pdf file');
  err.status = 400;
  cb(err);
};

/** Images + optional project PDF on create/update — PDFs allow up to 50MB. */
const listingAssetsMulter = multer({
  storage,
  limits: { fileSize: PDF_MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'project_pdf') {
      return pdfFilter(req, file, cb);
    }
    return fileFilter(req, file, cb);
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'project_pdf', maxCount: 1 },
]);

function formatFileSizeLimit(bytes) {
  const mb = bytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb}MB` : `${mb.toFixed(0)}MB`;
}

/** Multer middleware with clearer errors when a file exceeds the size limit. */
export function uploadListingAssets(req, res, next) {
  listingAssetsMulter(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      const pdfMax = formatFileSizeLimit(PDF_MAX_UPLOAD_BYTES);
      const imageMax = formatFileSizeLimit(IMAGE_MAX_BYTES);
      err.message = `File is too large. Images up to ${imageMax} each; project PDF up to ${pdfMax} (compressed automatically before storage).`;
      err.status = 400;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      err.message = 'Too many files uploaded.';
      err.status = 400;
    }

    next(err);
  });
}

export { IMAGE_MAX_BYTES, PDF_MAX_UPLOAD_BYTES };

const workerImagesMulter = multer({
  storage,
  limits: { fileSize: IMAGE_MAX_BYTES },
  fileFilter,
}).fields([
  { name: 'worker_photo', maxCount: 1 },
  { name: 'aadhar_image', maxCount: 1 },
  { name: 'hall_photo', maxCount: 1 },
]);

export function uploadWorkerImages(req, res, next) {
  workerImagesMulter(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = `Image is too large. Maximum size is ${formatFileSizeLimit(IMAGE_MAX_BYTES)}.`;
      err.status = 400;
    }
    next(err);
  });
}

export function uploadWorkerListingImages(req, res, next) {
  multer({
    storage,
    limits: { fileSize: IMAGE_MAX_BYTES },
    fileFilter,
  })
    .fields([
      { name: 'listing_images', maxCount: 4 },
      { name: 'listing_image', maxCount: 1 },
    ])(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.message = `Image is too large. Maximum size is ${formatFileSizeLimit(IMAGE_MAX_BYTES)}.`;
        err.status = 400;
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        err.message = 'Up to 4 images allowed per listing.';
        err.status = 400;
      }
      next(err);
    });
}

/** @deprecated use uploadWorkerListingImages */
export function uploadWorkerListingImage(req, res, next) {
  uploadWorkerListingImages(req, res, next);
}
