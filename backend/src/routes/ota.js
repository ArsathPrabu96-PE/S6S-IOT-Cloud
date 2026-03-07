import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import Firmware from '../models/Firmware.js';
import Device from '../models/Device.js';
import { authenticate } from '../middleware/auth.js';
import { getDeviceTopics } from '../utils/deviceFirmware.js';
import mqttService from '../services/mqttService.js';

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
// FIRMWARE MANAGEMENT
// ============================================

// List all firmware versions
router.get('/firmware', 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('deviceTypeId').optional().isInt(),
  query('isStable').optional().isBoolean(),
  validate,
  async (req, res) => {
    try {
      const { page, limit, deviceTypeId, isStable } = req.query;
      const result = await Firmware.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        deviceTypeId: deviceTypeId ? parseInt(deviceTypeId) : undefined,
        isStable: isStable !== undefined ? isStable === 'true' : undefined,
      });
      res.json(result);
    } catch (error) {
      console.error('List firmware error:', error);
      res.status(500).json({ error: 'Failed to fetch firmware list' });
    }
  }
);

// Upload new firmware
router.post('/firmware',
  body('name').notEmpty().trim().escape(),
  body('version').notEmpty().trim().escape(),
  body('deviceTypeId').isInt(),
  body('fileUrl').notEmpty().isURL(),
  body('fileSize').optional().isInt(),
  body('checksum').optional().trim(),
  body('description').optional().trim(),
  body('isStable').optional().isBoolean(),
  body('isDefault').optional().isBoolean(),
  validate,
  async (req, res) => {
    try {
      const firmware = await Firmware.create(req.user.id, req.body);
      res.status(201).json(firmware);
    } catch (error) {
      console.error('Create firmware error:', error);
      res.status(500).json({ error: 'Failed to create firmware' });
    }
  }
);

// Get firmware details
router.get('/firmware/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const firmware = await Firmware.findById(req.params.id);
      if (!firmware) {
        return res.status(404).json({ error: 'Firmware not found' });
      }
      res.json(firmware);
    } catch (error) {
      console.error('Get firmware error:', error);
      res.status(500).json({ error: 'Failed to fetch firmware' });
    }
  }
);

// Update firmware
router.put('/firmware/:id',
  param('id').isUUID(),
  body('name').optional().trim().escape(),
  body('version').optional().trim().escape(),
  body('description').optional().trim(),
  body('isStable').optional().isBoolean(),
  body('isDefault').optional().isBoolean(),
  validate,
  async (req, res) => {
    try {
      const firmware = await Firmware.update(req.params.id, req.user.id, req.body);
      if (!firmware) {
        return res.status(404).json({ error: 'Firmware not found' });
      }
      res.json(firmware);
    } catch (error) {
      console.error('Update firmware error:', error);
      res.status(500).json({ error: 'Failed to update firmware' });
    }
  }
);

// Delete firmware
router.delete('/firmware/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await Firmware.delete(req.params.id, req.user.id);
      if (!result) {
        return res.status(404).json({ error: 'Firmware not found' });
      }
      res.json({ message: 'Firmware deleted successfully' });
    } catch (error) {
      console.error('Delete firmware error:', error);
      res.status(500).json({ error: 'Failed to delete firmware' });
    }
  }
);

// Set firmware as default
router.post('/firmware/:id/set-default',
  param('id').isUUID(),
  body('deviceTypeId').isInt(),
  validate,
  async (req, res) => {
    try {
      const firmware = await Firmware.setAsDefault(
        req.params.id, 
        req.user.id, 
        parseInt(req.body.deviceTypeId)
      );
      if (!firmware) {
        return res.status(404).json({ error: 'Firmware not found' });
      }
      res.json({ message: 'Firmware set as default', firmware });
    } catch (error) {
      console.error('Set default firmware error:', error);
      res.status(500).json({ error: 'Failed to set default firmware' });
    }
  }
);

// ============================================
// OTA UPDATE OPERATIONS
// ============================================

// Start OTA update for a device
router.post('/devices/:deviceId/ota',
  param('deviceId').isUUID(),
  body('firmwareId').isUUID(),
  body('notify').optional().isBoolean(),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { firmwareId, notify = true } = req.body;

      // Verify device ownership
      const device = await Device.findById(deviceId, req.user.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Verify firmware exists
      const firmware = await Firmware.findById(firmwareId);
      if (!firmware) {
        return res.status(404).json({ error: 'Firmware not found' });
      }

      // Verify firmware is for the device type
      if (firmware.device_type_id !== device.device_type_id) {
        return res.status(400).json({ 
          error: 'Firmware is not compatible with this device type' 
        });
      }

      // Create OTA update record
      const update = await Firmware.createUpdate(req.user.id, {
        deviceId,
        firmwareId,
        status: 'initiated',
      });

      // Send OTA command via MQTT
      const topics = getDeviceTopics(device.device_uuid);
      const otaCommand = JSON.stringify({
        command: 'ota',
        firmwareUrl: firmware.file_url,
        firmwareVersion: firmware.version,
        checksum: firmware.checksum,
        fileSize: firmware.file_size,
      });

      await mqttService.publish(topics.commands, otaCommand);

      // Notify device if online
      if (device.status === 'online' && notify) {
        await mqttService.publish(
          topics.commands,
          JSON.stringify({ command: 'ota_start', updateId: update.id })
        );
      }

      res.status(200).json({
        message: 'OTA update initiated',
        update,
        deviceStatus: device.status,
      });
    } catch (error) {
      console.error('Start OTA error:', error);
      res.status(500).json({ error: 'Failed to initiate OTA update' });
    }
  }
);

// Get OTA update status for a device
router.get('/devices/:deviceId/ota/status',
  param('deviceId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;

      // Verify device ownership
      const device = await Device.findById(deviceId, req.user.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const updateStatus = await Firmware.getUpdateStatus(deviceId);
      res.json(updateStatus || { message: 'No OTA updates found' });
    } catch (error) {
      console.error('Get OTA status error:', error);
      res.status(500).json({ error: 'Failed to get OTA status' });
    }
  }
);

// Get OTA update history for a device
router.get('/devices/:deviceId/ota/history',
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { page, limit } = req.query;

      // Verify device ownership
      const device = await Device.findById(deviceId, req.user.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const history = await Firmware.getUpdateHistory(deviceId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res.json(history);
    } catch (error) {
      console.error('Get OTA history error:', error);
      res.status(500).json({ error: 'Failed to get OTA history' });
    }
  }
);

// Send OTA progress update (called by MQTT handler)
router.post('/devices/:deviceId/ota/progress',
  param('deviceId').isUUID(),
  body('updateId').isUUID(),
  body('status').isIn(['downloading', 'flashing', 'completed', 'failed']),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('error').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { updateId, status, progress, error } = req.body;

      await Firmware.updateStatus(updateId, status, { 
        progress, 
        error,
        updatedFrom: 'device',
      });

      // If completed, update device firmware version
      if (status === 'completed') {
        // Get firmware version info
        const updateRecord = await Firmware.getUpdateStatus(deviceId);
        if (updateRecord) {
          await Device.update(deviceId, null, { 
            firmware_version: updateRecord.firmware_version 
          });
        }
      }

      res.json({ message: 'OTA progress updated' });
    } catch (error) {
      console.error('OTA progress update error:', error);
      res.status(500).json({ error: 'Failed to update OTA progress' });
    }
  }
);

// Send restart command to device
router.post('/devices/:deviceId/restart',
  param('deviceId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;

      const device = await Device.findById(deviceId, req.user.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const topics = getDeviceTopics(device.device_uuid);
      await mqttService.publish(
        topics.commands,
        JSON.stringify({ command: 'restart' })
      );

      res.json({ message: 'Restart command sent', deviceStatus: device.status });
    } catch (error) {
      console.error('Restart device error:', error);
      res.status(500).json({ error: 'Failed to send restart command' });
    }
  }
);

// Get available firmware for a device
router.get('/devices/:deviceId/firmware/available',
  param('deviceId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { deviceId } = req.params;

      const device = await Device.findById(deviceId, req.user.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const latestFirmware = await Firmware.getLatestForDeviceType(
        device.device_type_id,
        true
      );
      
      const defaultFirmware = await Firmware.getDefaultForDeviceType(
        device.device_type_id
      );

      res.json({
        device,
        currentFirmware: device.firmware_version,
        latestStable: latestFirmware,
        default: defaultFirmware,
        isUpToDate: latestFirmware 
          ? latestFirmware.version === device.firmware_version 
          : true,
      });
    } catch (error) {
      console.error('Get available firmware error:', error);
      res.status(500).json({ error: 'Failed to get available firmware' });
    }
  }
);

export default router;
