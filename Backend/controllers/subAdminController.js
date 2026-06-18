import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { subAdminModel } from '../models/subAdminModel.js';
import { userModel } from '../models/userModel.js';
import { propertyModel } from '../models/propertyModel.js';

// Sub-admin login
export const subAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const subAdmin = await subAdminModel.findByEmail(email);
    if (!subAdmin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, subAdmin.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: subAdmin.id, email: subAdmin.email, isSubAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Sub-admin login successful',
      token,
      subAdmin: {
        id: subAdmin.id,
        name: subAdmin.name,
        email: subAdmin.email
      }
    });
  } catch (error) {
    console.error('Sub-admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Sub-admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await userModel.getCount();
    const totalProperties = await propertyModel.getCount();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
