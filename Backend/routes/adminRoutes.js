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
  deleteSubAdmin,
  adminGetAllWorkers,
} from '../controllers/adminController.js';
import { submitBrokerInternalRating } from '../controllers/brokerAdminController.js';
import {
  submitWorkerInternalReview,
  getWorkerReviewsAdmin,
} from '../controllers/workerAdminController.js';
import { lookupBrokerByPublicId } from '../controllers/brokerController.js';
import { addArea } from '../controllers/areaController.js';
import {
  adminListMissionRegistrations,
  adminUpdateMissionStatus,
} from '../controllers/missionController.js';
import {
  getStaffAlerts,
  markStaffAlertRead,
  markAllStaffAlertsRead,
} from '../controllers/staffAlertController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { uploadMultipleImages } from '../middleware/upload.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { previewModerateImages } from '../controllers/propertyController.js';

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
router.post('/moderate-images', uploadMultipleImages, previewModerateImages);
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

// Workers / vendors (full details for admin)
router.get('/workers', adminGetAllWorkers);
router.get('/workers/:workerId/reviews', getWorkerReviewsAdmin);
router.post('/workers/:workerId/reviews', submitWorkerInternalReview);

// Areas (global dropdown)
router.post('/areas', addArea);

// Mission co-ownership registrations
router.get('/mission/registrations', adminListMissionRegistrations);
router.patch('/mission/registrations/:id', adminUpdateMissionStatus);

// Staff notification bell
router.get('/staff-alerts', getStaffAlerts);
router.patch('/staff-alerts/read-all', markAllStaffAlertsRead);
router.patch('/staff-alerts/:id/read', markStaffAlertRead);

export default router;
