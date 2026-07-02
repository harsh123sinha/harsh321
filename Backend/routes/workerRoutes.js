import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { uploadWorkerImages, uploadWorkerListingImages } from '../middleware/upload.js';
import {
  getMyWorkerProfile,
  upsertMyWorkerProfile,
  getMyListings,
  createMyListing,
  updateMyListing,
  deleteMyListing,
  browsePublicVendors,
  getPublicVendorById,
} from '../controllers/workerController.js';
import { submitCustomerWorkerReview } from '../controllers/workerReviewController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/public', browsePublicVendors);
router.get('/public/:id', apiLimiter, getPublicVendorById);
router.get('/me', isAuthenticated, getMyWorkerProfile);
router.put('/me', isAuthenticated, uploadWorkerImages, upsertMyWorkerProfile);
router.get('/me/listings', isAuthenticated, getMyListings);
router.post('/me/listings', isAuthenticated, uploadWorkerListingImages, createMyListing);
router.put('/me/listings/:id', isAuthenticated, uploadWorkerListingImages, updateMyListing);
router.delete('/me/listings/:id', isAuthenticated, deleteMyListing);

const reviewRouter = express.Router();
reviewRouter.post('/', apiLimiter, isAuthenticated, submitCustomerWorkerReview);

export { reviewRouter };
export default router;
