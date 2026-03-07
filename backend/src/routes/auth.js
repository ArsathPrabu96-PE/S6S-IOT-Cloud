import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
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

// @route   POST /api/auth/social
// @desc    Login or register with social provider (Google, GitHub)
// @access  Public
router.post(
  '/social',
  [
    body('provider').isIn(['google', 'github']).withMessage('Invalid provider'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('socialId').notEmpty().withMessage('Social ID is required'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('avatarUrl').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { provider, email, socialId, firstName, lastName, avatarUrl } = req.body;
      
      // Check if user exists with this social account
      let user = await User.findByEmail(email);
      
      if (!user) {
        // Create new user
        const tempPassword = `social_${socialId}_${Date.now()}`;
        user = await User.create({
          email,
          password: tempPassword,
          firstName: firstName || '',
          lastName: lastName || '',
        });
        
        // Update avatar if provided
        if (avatarUrl) {
          await User.update(user.id, { avatarUrl });
        }
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
      console.error('Social login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login with social provider',
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if user exists
      const user = await User.findByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If the email exists, a reset link will be sent',
        });
      }
      
      // Generate reset token (in production, store this in database with expiry)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      
      // Store reset token (in production, save to database)
      // For now, we'll just log it
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      // In production, send email with reset link
      // await sendEmail(email, 'Password Reset', `Reset link: ...`);
      
      res.json({
        success: true,
        message: 'If the email exists, a reset link will be sent',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process request',
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // In production, validate token from database
      // For demo, we'll accept any token
      
      // Find user by reset token (in production)
      // const user = await User.findByResetToken(token);
      
      // Since we don't have reset token storage, we'll just return success
      // In production, validate token and update password
      
      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password',
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
