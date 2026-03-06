import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Device from '../models/Device.js';
import { authenticate } from '../middleware/auth.js';
import {
  getAllMicrocontrollers,
  getMicrocontrollerInfo,
  getMicrocontrollersByManufacturer,
  getMicrocontrollersWithWiFi,
  getMicrocontrollersWithBluetooth,
  generateFirmware,
  checkMicrocontrollerCompatibility,
  getProgrammingGuide,
} from '../utils/microcontroller.js';

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

// @route   GET /api/devices/types
// @desc    Get available device types
// @access  Private
router.get('/types', async (req, res) => {
  try {
    const types = await Device.getDeviceTypes();
    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('Get device types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device types',
    });
  }
});

// @route   GET /api/devices/protocols
// @desc    Get available device protocols
// @access  Private
router.get('/protocols', async (req, res) => {
  try {
    const protocols = await Device.getDeviceProtocols();
    res.json({
      success: true,
      data: protocols,
    });
  } catch (error) {
    console.error('Get device protocols error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device protocols',
    });
  }
});

// @route   GET /api/devices
// @desc    Get all devices for user
// @access  Private
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['online', 'offline', 'error', 'maintenance']),
    query('search').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      
      const result = await Device.listByUser(req.userId, {
        page,
        limit,
        status: req.query.status,
        search: req.query.search,
        deviceTypeId: req.query.deviceTypeId,
      });
      
      res.json({
        success: true,
        data: result.devices,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get devices',
      });
    }
  }
);

// @route   GET /api/devices/stats
// @desc    Get device statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const stats = await Device.getStats(req.userId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device statistics',
    });
  }
});

// @route   GET /api/devices/:id
// @desc    Get device by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id, req.userId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    
    // Get sensors for this device
    const sensors = await Device.listByDevice ? null : []; // Will add sensor listing
    
    res.json({
      success: true,
      data: {
        ...device,
        sensors,
      },
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device',
    });
  }
});

// @route   POST /api/devices
// @desc    Create a new device
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Device name is required'),
    body('description').optional().trim(),
    body('deviceTypeId').optional().isInt(),
    body('deviceProtocolId').optional().isInt(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('locationName').optional().trim(),
    body('timezone').optional().trim(),
    body('firmwareVersion').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const device = await Device.create(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        data: device,
      });
    } catch (error) {
      console.error('Create device error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create device',
      });
    }
  }
);

// @route   PUT /api/devices/:id
// @desc    Update device
// @access  Private
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('locationName').optional().trim(),
    body('timezone').optional().trim(),
    body('firmwareVersion').optional().trim(),
    body('config').optional().isObject(),
    body('metadata').optional().isObject(),
    body('tags').optional().isArray(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const device = await Device.update(req.params.id, req.userId, req.body);
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: 'Device not found',
        });
      }
      
      res.json({
        success: true,
        data: device,
      });
    } catch (error) {
      console.error('Update device error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update device',
      });
    }
  }
);

// @route   DELETE /api/devices/:id
// @desc    Delete device
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.delete(req.params.id, req.userId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete device',
    });
  }
});

// @route   POST /api/devices/:id/regenerate-credentials
// @desc    Regenerate MQTT credentials
// @access  Private
router.post('/:id/regenerate-credentials', async (req, res) => {
  try {
    const credentials = await Device.regenerateMqttCredentials(req.params.id, req.userId);
    
    if (!credentials) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    
    res.json({
      success: true,
      data: credentials,
    });
  } catch (error) {
    console.error('Regenerate credentials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate credentials',
    });
  }
});

// @route   POST /api/devices/:id/sensors
// @desc    Add sensor to device
// @access  Private
router.post(
  '/:id/sensors',
  [
    body('name').trim().notEmpty().withMessage('Sensor name is required'),
    body('identifier').trim().notEmpty().withMessage('Sensor identifier is required'),
    body('unit').optional().trim(),
    body('dataType').optional().isIn(['numeric', 'boolean', 'string']),
    body('icon').optional().trim(),
    body('chartType').optional().isIn(['line', 'gauge', 'bar']),
    body('color').optional().trim(),
    body('minThreshold').optional().isFloat(),
    body('maxThreshold').optional().isFloat(),
    body('thresholdEnabled').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      // Verify device exists and belongs to user
      const device = await Device.findById(req.params.id, req.userId);
      if (!device) {
        return res.status(404).json({
          success: false,
          error: 'Device not found',
        });
      }
      
      // Import Sensor model
      const { default: Sensor } = await import('../models/Sensor.js');
      const sensor = await Sensor.create(req.params.id, req.body);
      
      res.status(201).json({
        success: true,
        data: sensor,
      });
    } catch (error) {
      // Check for duplicate identifier
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Sensor with this identifier already exists',
        });
      }
      console.error('Create sensor error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create sensor',
      });
    }
  }
);

// @route   GET /api/devices/:id/sensors
// @desc    Get sensors for device
// @access  Private
router.get('/:id/sensors', async (req, res) => {
  try {
    // Verify device exists and belongs to user
    const device = await Device.findById(req.params.id, req.userId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    
    // Import Sensor model
    const { default: Sensor } = await import('../models/Sensor.js');
    const sensors = await Sensor.listByDevice(req.params.id, req.userId);
    
    res.json({
      success: true,
      data: sensors,
    });
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sensors',
    });
  }
});

// ============================================
// MICROCONTROLLER ROUTES
// ============================================

// @route   GET /api/devices/microcontrollers
// @desc    Get all supported microcontrollers
// @access  Private
router.get('/microcontrollers', async (req, res) => {
  try {
    const { filter } = req.query;
    
    let microcontrollers;
    switch (filter) {
      case 'wifi':
        microcontrollers = getMicrocontrollersWithWiFi();
        break;
      case 'bluetooth':
        microcontrollers = getMicrocontrollersWithBluetooth();
        break;
      case 'manufacturer':
        microcontrollers = getMicrocontrollersByManufacturer();
        break;
      default:
        microcontrollers = getAllMicrocontrollers();
    }
    
    res.json({
      success: true,
      data: microcontrollers,
    });
  } catch (error) {
    console.error('Get microcontrollers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get microcontrollers',
    });
  }
});

// @route   GET /api/devices/microcontrollers/:slug
// @desc    Get microcontroller details by slug
// @access  Private
router.get('/microcontrollers/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const microcontroller = getMicrocontrollerInfo(slug);
    
    if (!microcontroller) {
      return res.status(404).json({
        success: false,
        error: 'Microcontroller not found',
      });
    }
    
    // Get programming guide
    const guide = getProgrammingGuide(slug);
    
    res.json({
      success: true,
      data: {
        ...microcontroller,
        programmingGuide: guide,
      },
    });
  } catch (error) {
    console.error('Get microcontroller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get microcontroller',
    });
  }
});

// @route   POST /api/devices/microcontrollers/:slug/firmware
// @desc    Generate firmware for a specific microcontroller
// @access  Private
router.post(
  '/microcontrollers/:slug/firmware',
  [
    body('sensors').isArray().withMessage('Sensors array is required'),
    body('sensors.*.name').notEmpty().withMessage('Sensor name is required'),
    body('sensors.*.identifier').notEmpty().withMessage('Sensor identifier is required'),
    body('sensors.*.pin').optional().isInt(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { sensors } = req.body;
      const mqttServer = req.body.mqttServer || process.env.MQTT_SERVER || 'localhost';
      
      // Check if microcontroller exists
      const microcontroller = getMicrocontrollerInfo(slug);
      if (!microcontroller) {
        return res.status(404).json({
          success: false,
          error: 'Microcontroller not found',
        });
      }
      
      // Get device if provided (for MQTT credentials)
      const deviceUuid = req.body.deviceUuid || `DEV-${Date.now()}`;
      const mqttUsername = req.body.mqttUsername || deviceUuid;
      const mqttPassword = req.body.mqttPassword || 'mqtt_password';
      
      const firmware = generateFirmware(slug, {
        deviceUuid,
        mqttUsername,
        mqttPassword,
        mqttServer,
        sensors,
      });
      
      res.json({
        success: true,
        data: {
          microcontroller: slug,
          microcontrollerName: microcontroller.name,
          programmingLanguage: microcontroller.programmingLanguages[0],
          firmware,
        },
      });
    } catch (error) {
      console.error('Generate firmware error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate firmware',
      });
    }
  }
);

// @route   POST /api/devices/microcontrollers/:slug/check
// @desc    Check microcontroller compatibility with required features
// @access  Private
router.post(
  '/microcontrollers/:slug/check',
  [
    body('requiresWiFi').optional().isBoolean(),
    body('requiresBluetooth').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { requiresWiFi, requiresBluetooth } = req.body;
      
      const result = checkMicrocontrollerCompatibility(slug, {
        requiresWiFi,
        requiresBluetooth,
      });
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Check compatibility error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check compatibility',
      });
    }
  }
);

// @route   GET /api/devices/microcontrollers/:slug/firmware/download
// @desc    Download firmware file for microcontroller
// @access  Private
router.get('/microcontrollers/:slug/firmware/download', async (req, res) => {
  try {
    const { slug } = req.params;
    const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = req.query;
    
    const microcontroller = getMicrocontrollerInfo(slug);
    if (!microcontroller) {
      return res.status(404).json({
        success: false,
        error: 'Microcontroller not found',
      });
    }
    
    const firmware = generateFirmware(slug, {
      deviceUuid: deviceUuid || 'DEVICE_UUID',
      mqttUsername: mqttUsername || 'mqtt_username',
      mqttPassword: mqttPassword || 'mqtt_password',
      mqttServer: mqttServer || 'mqtt.example.com',
      sensors: (() => {
        if (!sensors) {
          return [{ name: 'Temperature', identifier: 'temperature', pin: 34 }];
        }
        try {
          return JSON.parse(sensors);
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            error: 'Invalid sensors JSON format',
          });
        }
      })(),
    });
    
    // Set appropriate content type based on microcontroller
    const extensions = {
      'ESP32': '.ino',
      'ESP32-S2': '.ino',
      'ESP32-S3': '.ino',
      'ESP32-C3': '.ino',
      'ESP8266': '.ino',
      'arduino-uno-wifi': '.ino',
      'arduino-nano-33-iot': '.ino',
      'arduino-mkr-wifi-1010': '.ino',
      'raspberry-pi-pico': '.ino',
      'raspberry-pi-pico-w': '.ino',
      'stm32-f401re': '.ino',
      'stm32-l476rg': '.ino',
      'stm32-wb55': '.ino',
      'nrf52840': '.ino',
      'nrf52832': '.ino',
      'cc3220': '.ino',
      'msp432': '.ino',
      'atmega4809': '.ino',
      'samd21': '.ino',
    };
    
    const extension = extensions[slug] || '.ino';
    const filename = `s6s_firmware_${slug}${extension}`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(firmware);
  } catch (error) {
    console.error('Download firmware error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download firmware',
    });
  }
});

export default router;
