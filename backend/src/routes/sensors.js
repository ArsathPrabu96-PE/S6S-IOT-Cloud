import express from 'express';
import { query, validationResult } from 'express-validator';
import Sensor from '../models/Sensor.js';
import Device from '../models/Device.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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

// @route   GET /api/sensors/:id
// @desc    Get sensor by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id, req.userId);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found',
      });
    }
    
    res.json({
      success: true,
      data: sensor,
    });
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sensor',
    });
  }
});

// @route   PUT /api/sensors/:id
// @desc    Update sensor
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.update(req.params.id, req.userId, req.body);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found',
      });
    }
    
    res.json({
      success: true,
      data: sensor,
    });
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sensor',
    });
  }
});

// @route   DELETE /api/sensors/:id
// @desc    Delete sensor
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.delete(req.params.id, req.userId);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Sensor deleted successfully',
    });
  } catch (error) {
    console.error('Delete sensor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sensor',
    });
  }
});

// @route   GET /api/sensors/:id/readings
// @desc    Get sensor readings
// @access  Private
router.get(
  '/:id/readings',
  [
    query('startTime').optional().isISO8601(),
    query('endTime').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 10000 }),
    query('interval').optional().isInt({ min: 60 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const sensor = await Sensor.findById(req.params.id, req.userId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          error: 'Sensor not found',
        });
      }
      
      const readings = await Sensor.getReadings(req.params.id, {
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        limit: parseInt(req.query.limit || '100', 10),
        interval: req.query.interval ? parseInt(req.query.interval, 10) : null,
      });
      
      res.json({
        success: true,
        data: readings,
      });
    } catch (error) {
      console.error('Get readings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get readings',
      });
    }
  }
);

// @route   GET /api/sensors/:id/stats
// @desc    Get sensor statistics
// @access  Private
router.get(
  '/:id/stats',
  [
    query('startTime').isISO8601().withMessage('Start time is required'),
    query('endTime').isISO8601().withMessage('End time is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const sensor = await Sensor.findById(req.params.id, req.userId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          error: 'Sensor not found',
        });
      }
      
      const stats = await Sensor.getStats(req.params.id, req.query.startTime, req.query.endTime);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
      });
    }
  }
);

// @route   GET /api/sensors/:id/latest
// @desc    Get latest sensor reading
// @access  Private
router.get('/:id/latest', async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id, req.userId);
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found',
      });
    }
    
    const reading = await Sensor.getLatestReading(req.params.id);
    
    res.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error('Get latest reading error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get latest reading',
    });
  }
});

// @route   GET /api/devices/:deviceId/readings
// @desc    Get all readings for a device
// @access  Private
router.get(
  '/device/:deviceId/readings',
  [
    query('startTime').optional().isISO8601(),
    query('endTime').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 10000 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const device = await Device.findById(req.params.deviceId, req.userId);
      if (!device) {
        return res.status(404).json({
          success: false,
          error: 'Device not found',
        });
      }
      
      const readings = await Sensor.getDeviceReadings(req.params.deviceId, {
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        limit: parseInt(req.query.limit || '100', 10),
      });
      
      res.json({
        success: true,
        data: readings,
      });
    } catch (error) {
      console.error('Get device readings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get device readings',
      });
    }
  }
);

export default router;
