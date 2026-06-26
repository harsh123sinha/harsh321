import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

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
