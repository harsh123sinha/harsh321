import express from 'express';
import {
  listSavedProperties,
  getSavedPropertyIds,
  saveProperty,
  unsaveProperty,
} from '../controllers/savedPropertyController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', apiLimiter, listSavedProperties);
router.get('/ids', apiLimiter, getSavedPropertyIds);
router.post('/:propertyId', apiLimiter, saveProperty);
router.delete('/:propertyId', apiLimiter, unsaveProperty);

export default router;
