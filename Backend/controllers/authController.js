import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';
import { isValidIndianMobile, generateOTP } from '../utils/helpers.js';
import { sendOTPEmail } from '../utils/email.js';

// In-memory OTP store (use Redis or DB table in production)
const otpStore = new Map();

// Signup controller
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirm_password, role, phone_number, accept_terms } = req.body;

    // Validation
    if (!name || !email || !password || !confirm_password || !role || !phone_number) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate Indian mobile number
    if (!isValidIndianMobile(phone_number)) {
      return res.status(400).json({ error: 'Invalid Indian mobile number. Must start with 6-9 and be 10 digits.' });
    }

    // Validate role
    const validRoles = ['owner', 'agent', 'buyer'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Must be owner, agent, or buyer.' });
    }

    if (!accept_terms) {
      return res.status(400).json({ error: 'You must accept the terms and conditions' });
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
      phone_number
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: role.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email,
        role: role.toLowerCase(),
        phone_number
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Forgot password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name);

    if (!emailResult.success) {
      const isConfig =
        emailResult.error === 'SMTP_NOT_CONFIGURED' ||
        String(emailResult.error || '').includes('SMTP_NOT_CONFIGURED');
      const message = isConfig
        ? 'Password reset email is not set up on the server (SMTP). Add SMTP settings in Backend/.env or contact support.'
        : 'Failed to send OTP email. Check SMTP credentials and try again.';
      console.error('Forgot password email failed:', emailResult.error || '(unknown)');
      return res.status(500).json({ error: message });
    }

    res.json({
      success: true,
      message: emailResult.devConsoleFallback
        ? 'This network blocked email to Gmail. OTP is printed in the backend terminal (DEV_OTP_TO_CONSOLE). Use it within 10 minutes.'
        : 'OTP sent to your email. Valid for 10 minutes.',
      devConsoleFallback: Boolean(emailResult.devConsoleFallback),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get stored OTP
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified - generate reset token (short-lived)
    const resetToken = jwt.sign(
      { email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Remove OTP from store
    otpStore.delete(email);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password-reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userModel.updatePassword(decoded.email, hashedPassword);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout (client-side handles token removal, but endpoint for consistency)
export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
