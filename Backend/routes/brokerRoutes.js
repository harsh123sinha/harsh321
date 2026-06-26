import express from 'express';
import {
  searchBrokers,
  getBrokerDetail,
  getBrokerReviews,
  getBrokerProperties,
} from '../controllers/brokerController.js';
import { submitCustomerBrokerReview } from '../controllers/brokerReviewController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', apiLimiter, searchBrokers);
router.get('/:brokerId/reviews', apiLimiter, getBrokerReviews);
router.get('/:brokerId/properties', apiLimiter, getBrokerProperties);
router.get('/:brokerId', apiLimiter, getBrokerDetail);

const reviewRouter = express.Router();
reviewRouter.post('/', apiLimiter, isAuthenticated, submitCustomerBrokerReview);

export { reviewRouter };
export default router;
