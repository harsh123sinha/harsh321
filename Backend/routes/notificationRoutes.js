import express from 'express';
import {
  registerFcmToken,
  removeFcmToken,
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(isAuthenticated);

router.post('/fcm/register', apiLimiter, registerFcmToken);
router.delete('/fcm', apiLimiter, removeFcmToken);

router.get('/', apiLimiter, listNotifications);
router.get('/unread-count', apiLimiter, getUnreadCount);
router.patch('/read-all', apiLimiter, markAllNotificationsRead);
router.patch('/:id/read', apiLimiter, markNotificationRead);

export default router;
