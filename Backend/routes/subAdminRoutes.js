import express from 'express';
import { subAdminLogin, getDashboardStats } from '../controllers/subAdminController.js';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  adminGetAllProperties,
  adminCreateProperty,
  toggleFeatured,
  adminUpdateProperty,
  adminDeleteProperty,
  approvePropertyListing
} from '../controllers/adminController.js';
import { submitBrokerInternalRating } from '../controllers/brokerAdminController.js';
import { lookupBrokerByPublicId } from '../controllers/brokerController.js';
import { addArea } from '../controllers/areaController.js';
import {
  adminListMissionRegistrations,
  adminUpdateMissionStatus,
} from '../controllers/missionController.js';
import {
  adminListUserDemands,
  adminUpdateUserDemandStatus,
} from '../controllers/demandController.js';
import {
  getStaffAlerts,
  markStaffAlertRead,
  markAllStaffAlertsRead,
} from '../controllers/staffAlertController.js';
import { isAuthenticated, isSubAdmin } from '../middleware/auth.js';
import { uploadMultipleImages, uploadListingAssets } from '../middleware/upload.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { previewModerateImages } from '../controllers/propertyController.js';

const router = express.Router();

router.post('/login', authLimiter, subAdminLogin);

router.use(isAuthenticated, isSubAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.post('/moderate-images', uploadMultipleImages, previewModerateImages);
router.get('/properties', adminGetAllProperties);
router.post('/properties', uploadListingAssets, adminCreateProperty);
router.post('/properties/:id/toggle-featured', toggleFeatured);
router.put('/properties/:id', uploadMultipleImages, adminUpdateProperty);
router.post('/properties/:id/approve', approvePropertyListing);
router.delete('/properties/:id', adminDeleteProperty);

router.get('/brokers/lookup', lookupBrokerByPublicId);
router.post('/broker-ratings', submitBrokerInternalRating);

// Areas (global dropdown)
router.post('/areas', addArea);

router.get('/mission/registrations', adminListMissionRegistrations);
router.patch('/mission/registrations/:id', adminUpdateMissionStatus);

router.get('/demands', adminListUserDemands);
router.patch('/demands/:id', adminUpdateUserDemandStatus);

router.get('/staff-alerts', getStaffAlerts);
router.patch('/staff-alerts/read-all', markAllStaffAlertsRead);
router.patch('/staff-alerts/:id/read', markStaffAlertRead);

export default router;
