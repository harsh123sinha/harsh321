import express from 'express';
import {
  signup,
  login,
  logout,
  getProfile,
  forgotPassword,
  verifyOTP,
  resetPassword
} from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/profile', isAuthenticated, getProfile);
router.post('/logout', isAuthenticated, logout);

export default router;
