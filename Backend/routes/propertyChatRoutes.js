import express from 'express';
import {
  startPropertyChat,
  listUserPropertyChats,
  getUserPropertyChatUnreadCount,
  getUserPropertyChat,
  postUserPropertyChatMessage,
  markUserPropertyChatRead,
} from '../controllers/propertyChatController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(isAuthenticated);

router.post('/start', apiLimiter, startPropertyChat);
router.get('/', apiLimiter, listUserPropertyChats);
router.get('/unread-count', apiLimiter, getUserPropertyChatUnreadCount);
router.get('/:id', apiLimiter, getUserPropertyChat);
router.post('/:id/messages', apiLimiter, postUserPropertyChatMessage);
router.patch('/:id/read', apiLimiter, markUserPropertyChatRead);

export default router;
