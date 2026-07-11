import express from 'express';
import { createUserDemand } from '../controllers/demandController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', apiLimiter, createUserDemand);

export default router;
