import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  getMyProperties,
  getPropertiesByType,
  searchProperties,
  addProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { isAuthenticated, isOwnerOrAgent } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { uploadMultipleImages } from '../middleware/upload.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, getAllProperties);
router.get('/search', apiLimiter, optionalAuth, searchProperties);
router.get('/type/:type', apiLimiter, getPropertiesByType);
router.get('/:id', apiLimiter, getPropertyById);

// Protected routes (authenticated users)
router.get('/user/my-properties', isAuthenticated, getMyProperties);

// Protected routes (owner/agent only)
router.post('/', isAuthenticated, isOwnerOrAgent, uploadMultipleImages, addProperty);
router.put('/:id', isAuthenticated, isOwnerOrAgent, uploadMultipleImages, updateProperty);
router.delete('/:id', isAuthenticated, deleteProperty); // Owner or admin

export default router;
