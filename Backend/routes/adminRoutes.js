import express from 'express';
import {
  adminLogin,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  adminGetAllProperties,
  adminCreateProperty,
  toggleFeatured,
  adminUpdateProperty,
  adminDeleteProperty,
  approvePropertyListing,
  getAllSubAdmins,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin
} from '../controllers/adminController.js';
import { submitBrokerInternalRating } from '../controllers/brokerAdminController.js';
import { lookupBrokerByPublicId } from '../controllers/brokerController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { uploadMultipleImages } from '../middleware/upload.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin login (public)
router.post('/login', authLimiter, adminLogin);

// Protected admin routes
router.use(isAuthenticated, isAdmin); // All routes below require admin auth

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Property management
router.get('/properties', adminGetAllProperties);
router.post('/properties', uploadMultipleImages, adminCreateProperty);
router.post('/properties/:id/toggle-featured', toggleFeatured);
router.put('/properties/:id', uploadMultipleImages, adminUpdateProperty);
router.post('/properties/:id/approve', approvePropertyListing);
router.delete('/properties/:id', adminDeleteProperty);

router.get('/brokers/lookup', lookupBrokerByPublicId);
router.post('/broker-ratings', submitBrokerInternalRating);

// Sub-admin management
router.get('/subadmins', getAllSubAdmins);
router.post('/subadmins', createSubAdmin);
router.put('/subadmins/:id', updateSubAdmin);
router.delete('/subadmins/:id', deleteSubAdmin);

export default router;
