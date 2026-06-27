import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  getMyProperties,
  getPropertiesByType,
  getPropertyRecommendations,
  searchProperties,
  addProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { isAuthenticated, isOwnerOrAgent } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { uploadListingAssets } from '../middleware/upload.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, getAllProperties);
router.get('/recommendations', apiLimiter, optionalAuth, getPropertyRecommendations);
router.get('/search', apiLimiter, optionalAuth, searchProperties);
router.get('/type/:type', apiLimiter, getPropertiesByType);
router.get('/:id', apiLimiter, getPropertyById);

// Protected routes (authenticated users)
router.get('/user/my-properties', isAuthenticated, getMyProperties);

// Protected routes (owner/agent only)
router.post('/', isAuthenticated, isOwnerOrAgent, uploadListingAssets, addProperty);
router.put('/:id', isAuthenticated, isOwnerOrAgent, uploadListingAssets, updateProperty);
router.delete('/:id', isAuthenticated, deleteProperty); // Owner or admin

export default router;
