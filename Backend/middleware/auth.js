import jwt from 'jsonwebtoken';
import { adminModel } from '../models/adminModel.js';

/** Normalize email for admin checks (trim + lowercase). */
export const normEmail = (e) => (e || '').trim().toLowerCase();

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is authenticated
export const isAuthenticated = verifyToken;

/** Buyers only */
export const isBuyer = (req, res, next) => {
  if (req.user?.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyers only.' });
  }
  next();
};

// Check if user is owner or agent (can add properties)
export const isOwnerOrAgent = (req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'agent') {
    return res.status(403).json({ error: 'Access denied. Only owners and agents can perform this action.' });
  }
  next();
};

// Check if user is admin (JWT issued after successful admin login)
export const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Check if user is sub-admin
export const isSubAdmin = (req, res, next) => {
  if (!req.user.isSubAdmin) {
    return res.status(403).json({ error: 'Access denied. Sub-admin only.' });
  }
  next();
};

// Verify admin login against `admins` table (bcrypt hashed password)
export const verifyAdminCredentials = async (email, password, bcrypt) => {
  const admin = await adminModel.findByEmail(email);
  if (!admin?.hashed_password) {
    return false;
  }

  try {
    return await bcrypt.compare(password, admin.hashed_password);
  } catch {
    return false;
  }
};
