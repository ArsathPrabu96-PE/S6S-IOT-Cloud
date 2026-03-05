import Aedes from 'aedes';
import { createServer } from 'net';
import http from 'http';
import { WebSocketServer } from 'ws';
import config from '../config/index.js';
import { query } from '../config/database.js';
import Device from '../models/Device.js';
import Sensor from '../models/Sensor.js';

// Create Aedes broker instance
const aedes = new Aedes({
  id: 's6s-iot-broker',
  qos: config.mqtt.qos,
});

// Store for WebSocket connections
const wsClients = new Map();

// MQTT Authentication
aedes.authenticate = async (client, username, password) => {
  try {
    // Convert buffers to strings
    const usernameStr = username ? username.toString() : '';
    const passwordStr = password ? password.toString() : '';
    
    // Find device by MQTT username
    const device = await Device.findByMqttCredentials(usernameStr);
    
    if (!device) {
      console.log(`MQTT Auth Failed: Device not found - ${usernameStr}`);
      return false;
    }
    
    // Verify password using bcrypt
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.default.compare(passwordStr, device.mqtt_password_hash);
    
    if (!isValid) {
      console.log(`MQTT Auth Failed: Invalid password for ${usernameStr}`);
      return false;
    }
    
    // Store device info in client
    client.device = device;
    console.log(`MQTT Auth Success: ${usernameStr} (Device: ${device.name})`);
    return true;
  } catch (error) {
    console.error('MQTT Auth Error:', error);
    return false;
  }
};

// Handle published messages
aedes.on('publish', async (packet, client) => {
  if (!client || !client.device) return;
  
  try {
    const topic = packet.topic;
    const payload = packet.payload ? JSON.parse(packet.payload.toString()) : null;
    
    // Expected topic format: {device_uuid}/sensors/{sensor_identifier}
    const topicParts = topic.split('/');
    
    if (topicParts.length < 3) {
      console.log('Invalid topic format:', topic);
      return;
    }
    
    const deviceUuid = topicParts[0];
    const sensorIdentifier = topicParts[2];
    const dataType = topicParts[1]; // sensors, status, config
    
    const device = await Device.findByUuid(deviceUuid);
    if (!device) {
      console.log('Device not found:', deviceUuid);
      return;
    }
    
    if (dataType === 'sensors' && payload) {
      // Handle sensor data
      // Payload can be { temperature: 25.5 } or [{ identifier: 'temp', value: 25.5 }]
      const readings = [];
      
      if (Array.isArray(payload)) {
        // Array format: [{ identifier, value, timestamp? }]
        for (const item of payload) {
          const sensor = await Sensor.findByDeviceAndIdentifier(device.id, item.identifier);
          if (sensor) {
            readings.push({
              sensorId: sensor.id,
              deviceId: device.id,
              value: parseFloat(item.value),
              quality: item.quality || 100,
              timestamp: item.timestamp || new Date(),
            });
          }
        }
      } else if (typeof payload === 'object') {
        // Object format: { temperature: 25.5, humidity: 60 }
        for (const [identifier, value] of Object.entries(payload)) {
          const sensor = await Sensor.findByDeviceAndIdentifier(device.id, identifier);
          if (sensor) {
            readings.push({
              sensorId: sensor.id,
              deviceId: device.id,
              value: parseFloat(value),
              quality: 100,
              timestamp: new Date(),
            });
          }
        }
      }
      
      if (readings.length > 0) {
        await Sensor.addReadingsBatch(readings);
        console.log(`Stored ${readings.length} sensor readings for device ${deviceUuid}`);
        
        // Check thresholds and emit alerts
        for (const reading of readings) {
          const thresholdAlert = await Sensor.checkThreshold(reading.sensorId, reading.value);
          if (thresholdAlert) {
            // Emit alert via WebSocket
            emitAlert(device.user_id, {
              type: 'threshold',
              deviceId: device.id,
              deviceName: device.name,
              sensorId: reading.sensorId,
              sensorIdentifier: thresholdAlert.sensor.identifier,
              value: reading.value,
              threshold: thresholdAlert.thresholdValue,
              alertType: thresholdAlert.alertType,
              severity: 'warning',
            });
          }
        }
        
        // Broadcast to WebSocket clients
        broadcastToDeviceUsers(device.user_id, {
          type: 'sensor_data',
          deviceId: device.id,
          deviceName: device.name,
          readings: readings.map(r => ({
            sensorId: r.sensorId,
            value: r.value,
            timestamp: r.timestamp,
          })),
        });
      }
    } else if (dataType === 'status') {
      // Handle device status update
      const status = payload?.status || 'online';
      await Device.updateStatus(device.id, status);
      
      // Update last seen
      await query(
        'UPDATE devices SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1',
        [device.id]
      );
      
      broadcastToDeviceUsers(device.user_id, {
        type: 'device_status',
        deviceId: device.id,
        deviceName: device.name,
        status,
      });
    }
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Handle client connections
aedes.on('client', (client) => {
  console.log(`Client connected: ${client.id}`);
  if (client.device) {
    console.log(`  Device: ${client.device.name} (${client.device.device_uuid})`);
  }
});

// Handle client disconnections
aedes.on('clientDisconnect', (client) => {
  console.log(`Client disconnected: ${client.id}`);
  if (client.device) {
    // Update device status to offline
    Device.updateStatus(client.device.id, 'offline').catch(console.error);
  }
});

// Handle errors
aedes.on('error', (error) => {
  console.error('Aedes error:', error);
});

// Broadcast to specific user's WebSocket clients
function broadcastToDeviceUsers(userId, message) {
  const clients = wsClients.get(userId);
  if (clients) {
    const messageStr = JSON.stringify(message);
    clients.forEach((ws) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(messageStr);
      }
    });
  }
}

// Emit alerts to user
function emitAlert(userId, alert) {
  broadcastToDeviceUsers(userId, {
    type: 'alert',
    ...alert,
  });
}

// Create TCP server for MQTT
const mqttServer = createServer(aedes.handle);

// Create HTTP server for WebSocket
const httpServer = http.createServer();
const wss = new WebSocketServer({ server: httpServer });

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  // Get user from query string (in production, use proper auth)
  const url = new URL(req.url, 'http://localhost');
  const userId = url.searchParams.get('userId');
  const token = url.searchParams.get('token');
  
  if (!userId || !token) {
    ws.close(4001, 'Unauthorized');
    return;
  }
  
  // Verify token (simplified - in production use proper JWT verification)
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (decoded.userId !== userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }
    
    // Add to user clients
    if (!wsClients.has(userId)) {
      wsClients.set(userId, new Set());
    }
    wsClients.get(userId).add(ws);
    
    console.log(`WebSocket client connected for user ${userId}`);
    
    ws.on('close', () => {
      const clients = wsClients.get(userId);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
          wsClients.delete(userId);
        }
      }
      console.log(`WebSocket client disconnected for user ${userId}`);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', userId }));
  } catch (error) {
    ws.close(4001, 'Invalid token');
  }
});

// Start MQTT broker
export const startMqttBroker = async () => {
  return new Promise((resolve, reject) => {
    mqttServer.listen(config.mqtt.port, () => {
      console.log(`✅ MQTT broker started on port ${config.mqtt.port}`);
    });
    
    mqttServer.on('error', (err) => {
      console.error('MQTT server error:', err);
      reject(err);
    });
    
    // Start WebSocket server
    httpServer.listen(config.mqtt.websocketPort, () => {
      console.log(`✅ WebSocket server started on port ${config.mqtt.websocketPort}`);
    });
    
    httpServer.on('error', (err) => {
      console.error('WebSocket server error:', err);
    });
    
    resolve({
      mqttPort: config.mqtt.port,
      wsPort: config.mqtt.websocketPort,
    });
  });
};

// Stop MQTT broker
export const stopMqttBroker = async () => {
  return new Promise((resolve) => {
    mqttServer.close(() => {
      console.log('MQTT broker stopped');
    });
    httpServer.close(() => {
      console.log('WebSocket server stopped');
      resolve();
    });
  });
};

export { aedes, broadcastToDeviceUsers };
export default { startMqttBroker, stopMqttBroker, aedes, broadcastToDeviceUsers };
