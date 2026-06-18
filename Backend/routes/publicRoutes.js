import express from 'express';
import { getHomeData, getRandomProperties, getStats } from '../controllers/publicController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/home', apiLimiter, getHomeData);
router.get('/random-properties', apiLimiter, getRandomProperties);
router.get('/stats', apiLimiter, getStats);

export default router;
