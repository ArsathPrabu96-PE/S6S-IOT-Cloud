import express from 'express';
import { query, param, validationResult } from 'express-validator';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============================================
// NOTIFICATIONS API
// ============================================

// Get all notifications
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('unreadOnly').optional().isBoolean(),
  query('type').optional().isString(),
  validate,
  async (req, res) => {
    try {
      const { page, limit, unreadOnly, type } = req.query;
      const result = await Notification.getForUser(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        unreadOnly: unreadOnly === 'true',
        type,
      });
      res.json(result);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
);

// Get unread count
router.get('/unread-count',
  async (req, res) => {
    try {
      const count = await Notification.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
);

// Mark notification as read
router.post('/:id/read',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const notification = await Notification.markAsRead(req.params.id, req.user.id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json(notification);
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

// Mark all as read
router.post('/read-all',
  async (req, res) => {
    try {
      await Notification.markAllAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  }
);

// Delete notification
router.delete('/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await Notification.delete(req.params.id, req.user.id);
      if (!result) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
);

// Delete all read notifications
router.delete('/',
  async (req, res) => {
    try {
      await Notification.deleteRead(req.user.id);
      res.json({ message: 'All read notifications deleted' });
    } catch (error) {
      console.error('Delete read notifications error:', error);
      res.status(500).json({ error: 'Failed to delete read notifications' });
    }
  }
);

export default router;
