import express from 'express';
import { getHomeData, getRandomProperties, getStats, getFeaturedProjects, getProjectById, getSitemap } from '../controllers/publicController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/home', apiLimiter, getHomeData);
router.get('/projects', apiLimiter, getFeaturedProjects);
router.get('/projects/:id', apiLimiter, getProjectById);
router.get('/random-properties', apiLimiter, getRandomProperties);
router.get('/stats', apiLimiter, getStats);
router.get('/sitemap.xml', getSitemap);

export default router;
