import mqtt from 'mqtt';
import config from '../config/index.js';
import Sensor from '../models/Sensor.js';
import Device from '../models/Device.js';
import { query } from '../config/database.js';

class MqttService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const mqttUrl = `mqtt://${config.mqtt.host}:${config.mqtt.port}`;

      this.client = mqtt.connect(mqttUrl, {
        clientId: `s6s_iot_platform_${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        username: config.mqtt.username,
        password: config.mqtt.password,
      });

      this.client.on('connect', () => {
        this.connected = true;
        console.log('✅ MQTT Broker connected');

        // Subscribe to device topics
        this.subscribe('device/+/data');
        this.subscribe('device/+/status');
        this.subscribe('device/+/heartbeat');

        resolve();
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

      this.client.on('error', (error) => {
        console.error('❌ MQTT Error:', error.message);
      });

      this.client.on('close', () => {
        this.connected = false;
        console.log('⚠️ MQTT Disconnected');
      });

      this.client.on('reconnect', () => {
        console.log('🔄 MQTT Reconnecting...');
      });
    });
  }

  subscribe(topic) {
    if (this.client && this.connected) {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`📡 Subscribed to ${topic}`);
          this.subscriptions.set(topic, true);
        }
      });
    }
  }

  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split('/');

      // Topic format: device/{deviceId}/data
      if (topicParts[2] === 'data') {
        await this.handleSensorData(topicParts[1], payload);
      } else if (topicParts[2] === 'status') {
        await this.handleDeviceStatus(topicParts[1], payload);
      } else if (topicParts[2] === 'heartbeat') {
        await this.handleHeartbeat(topicParts[1], payload);
      }
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error);
    }
  }

  async handleSensorData(deviceId, payload) {
    try {
      // Process and store sensor data
      // Find device and its sensors
      const device = await Device.findByUuid(deviceId);
      
      if (!device) {
        console.log(`Device ${deviceId} not found`);
        return;
      }
      
      // Process each sensor data point
      const readings = [];
      for (const [identifier, value] of Object.entries(payload)) {
        const sensor = await Sensor.findByDeviceAndIdentifier(device.id, identifier);
        if (sensor) {
          await Sensor.addReading(sensor.id, device.id, value);
          readings.push({ sensor, value });
        }
      }

      console.log(`📊 Sensor data received from ${deviceId}:`, payload);
    } catch (error) {
      console.error('❌ Error processing sensor data:', error);
    }
  }

  async handleDeviceStatus(deviceId, payload) {
    try {
      const status = payload.status === 'online' ? 'online' : 'offline';
      const device = await Device.findByUuid(deviceId);
      
      if (device) {
        await Device.update(device.id, { is_online: status === 'online' });

        // Emit to WebSocket for real-time updates
        const io = global.io;
        if (io) {
          io.to(`user:${device.user_id}`).emit('device_status', {
            deviceId,
            status,
            timestamp: new Date(),
          });
        }
      }

      console.log(`📱 Device ${deviceId} status: ${status}`);
    } catch (error) {
      console.error('❌ Error handling device status:', error);
    }
  }

  async handleHeartbeat(deviceId, payload) {
    try {
      const device = await Device.findByUuid(deviceId);
      if (device) {
        await Device.update(device.id, { is_online: true, last_seen: new Date() });
      }

      console.log(`💓 Heartbeat from ${deviceId}`);
    } catch (error) {
      console.error('❌ Error handling heartbeat:', error);
    }
  }

  // Publish message to device
  publish(topic, message) {
    if (this.client && this.connected) {
      this.client.publish(topic, JSON.stringify(message), { qos: 1 });
    }
  }

  // Send command to specific device
  sendCommand(deviceId, command) {
    this.publish(`device/${deviceId}/command`, {
      ...command,
      timestamp: new Date().toISOString(),
    });
  }

  // Request device configuration
  requestConfig(deviceId) {
    this.sendCommand(deviceId, { action: 'get_config' });
  }

  // Update device configuration
  updateConfig(deviceId, config) {
    this.sendCommand(deviceId, { action: 'set_config', config });
  }

  // Restart device
  restartDevice(deviceId) {
    this.sendCommand(deviceId, { action: 'restart' });
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const mqttService = new MqttService();
export default mqttService;
