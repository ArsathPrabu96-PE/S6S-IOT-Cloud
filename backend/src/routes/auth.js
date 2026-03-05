import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('company').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, company, phone } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered',
        });
      }
      
      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        company,
        phone,
      });
      
      // Generate tokens
      const tokens = generateTokens(user.id);
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            company: user.company,
          },
          ...tokens,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user',
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }
      
      // Check password
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }
      
      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Account is disabled',
        });
      }
      
      // Generate tokens
      const tokens = generateTokens(user.id);
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            company: user.company,
            avatarUrl: user.avatar_url,
          },
          ...tokens,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login',
      });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive',
        });
      }
      
      // Generate new tokens
      const tokens = generateTokens(user.id);
      
      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const subscription = await User.getSubscription(req.userId);
    const deviceCount = await User.getDeviceCount(req.userId);
    
    res.json({
      success: true,
      data: {
        user: req.user,
        subscription,
        deviceCount,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('company').optional().trim(),
    body('phone').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { firstName, lastName, company, phone } = req.body;
      
      const user = await User.update(req.userId, {
        firstName,
        lastName,
        company,
        phone,
      });
      
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  }
);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get user with password
      const user = await User.findByEmail(req.user.email);
      
      // Verify current password
      const isValidPassword = await User.verifyPassword(user, currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }
      
      // Update password
      await User.update(req.userId, { password: newPassword });
      
      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
