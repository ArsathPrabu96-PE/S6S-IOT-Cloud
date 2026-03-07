import express from 'express';
import { query, param, validationResult } from 'express-validator';
import Analytics from '../models/Analytics.js';
import Device from '../models/Device.js';
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
// ANALYTICS API
// ============================================

// Get dashboard analytics
router.get('/dashboard',
  query('days').optional().isInt({ min: 1, max: 365 }),
  validate,
  async (req, res) => {
    try {
      const { days } = req.query;
      const analytics = await Analytics.getDashboardAnalytics(req.user.id, {
        days: parseInt(days) || 7,
      });
      res.json(analytics);
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
  }
);

// Get hourly sensor data
router.get('/sensors/:sensorId/hourly',
  param('sensorId').isUUID(),
  query('startTime').optional().isISO8601(),
  query('endTime').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 168 }),
  validate,
  async (req, res) => {
    try {
      const { sensorId } = req.params;
      const { startTime, endTime, limit } = req.query;
      
      const end = endTime ? new Date(endTime) : new Date();
      const start = startTime ? new Date(startTime) : new Date(end.getTime() - 24 * 60 * 60 * 1000);
      
      const data = await Analytics.getHourlyData(sensorId, {
        startTime: start,
        endTime: end,
        limit: parseInt(limit) || 24,
      });
      
      res.json(data);
    } catch (error) {
      console.error('Get hourly analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch hourly data' });
    }
  }
);

// Get daily sensor data
router.get('/sensors/:sensorId/daily',
  param('sensorId').isUUID(),
  query('startTime').optional().isISO8601(),
  query('endTime').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 365 }),
  validate,
  async (req, res) => {
    try {
      const { sensorId } = req.params;
      const { startTime, endTime, limit } = req.query;
      
      const end = endTime ? new Date(endTime) : new Date();
      const start = startTime ? new Date(startTime) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const data = await Analytics.getDailyData(sensorId, {
        startTime: start,
        endTime: end,
        limit: parseInt(limit) || 30,
      });
      
      res.json(data);
    } catch (error) {
      console.error('Get daily analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch daily data' });
    }
  }
);

// Get sensor statistics
router.get('/sensors/:sensorId/stats',
  param('sensorId').isUUID(),
  query('startTime').optional().isISO8601(),
  query('endTime').optional().isISO8601(),
  validate,
  async (req, res) => {
    try {
      const { sensorId } = req.params;
      const { startTime, endTime } = req.query;
      
      const end = endTime ? new Date(endTime) : new Date();
      const start = startTime ? new Date(startTime) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const stats = await Analytics.getStats(sensorId, start, end);
      res.json(stats);
    } catch (error) {
      console.error('Get sensor stats error:', error);
      res.status(500).json({ error: 'Failed to fetch sensor statistics' });
    }
  }
);

// Get trend analysis
router.get('/sensors/:sensorId/trend',
  param('sensorId').isUUID(),
  query('periods').optional().isInt({ min: 2, max: 90 }),
  query('interval').optional().isString(),
  validate,
  async (req, res) => {
    try {
      const { sensorId } = req.params;
      const { periods, interval } = req.query;
      
      const trend = await Analytics.getTrendAnalysis(sensorId, {
        periods: parseInt(periods) || 7,
        interval: interval || '1 day',
      });
      
      res.json(trend);
    } catch (error) {
      console.error('Get trend analysis error:', error);
      res.status(500).json({ error: 'Failed to fetch trend analysis' });
    }
  }
);

// Detect anomalies
router.get('/sensors/:sensorId/anomalies',
  param('sensorId').isUUID(),
  query('startTime').optional().isISO8601(),
  query('endTime').optional().isISO8601(),
  query('threshold').optional().isFloat({ min: 1, max: 10 }),
  validate,
  async (req, res) => {
    try {
      const { sensorId } = req.params;
      const { startTime, endTime, threshold } = req.query;
      
      const end = endTime ? new Date(endTime) : new Date();
      const start = startTime ? new Date(startTime) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const anomalies = await Analytics.detectAnomalies(sensorId, {
        startTime: start,
        endTime: end,
        stdDevThreshold: parseFloat(threshold) || 3,
      });
      
      res.json({ anomalies, count: anomalies.length });
    } catch (error) {
      console.error('Get anomalies error:', error);
      res.status(500).json({ error: 'Failed to detect anomalies' });
    }
  }
);

// Compare multiple sensors
router.post('/compare',
  query('sensorIds').optional().isString(),
  query('startTime').optional().isISO8601(),
  query('endTime').optional().isISO8601(),
  validate,
  async (req, res) => {
    try {
      const { sensorIds } = req.query;
      const { startTime, endTime } = req.query;
      
      const end = endTime ? new Date(endTime) : new Date();
      const start = startTime ? new Date(startTime) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const ids = sensorIds ? sensorIds.split(',') : (req.body.sensorIds || []);
      
      if (ids.length === 0) {
        return res.status(400).json({ error: 'No sensor IDs provided' });
      }
      
      const comparison = await Analytics.compareSensors(ids, start, end);
      res.json(comparison);
    } catch (error) {
      console.error('Compare sensors error:', error);
      res.status(500).json({ error: 'Failed to compare sensors' });
    }
  }
);

// Get device analytics
router.get('/devices/:deviceId',
  param('deviceId').isUUID(),
  query('startDate').optional().isDate(),
  query('endDate').optional().isDate(),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { startDate, endDate } = req.query;
      
      // Verify ownership
      const device = await Device.findById(deviceId, req.user.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const analytics = await Analytics.getDeviceAnalytics(deviceId, start, end);
      res.json(analytics);
    } catch (error) {
      console.error('Get device analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch device analytics' });
    }
  }
);

export default router;
