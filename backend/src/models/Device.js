import { v4 as uuidv4 } from 'uuid';
import { query, one, many, count, transaction } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class Device {
  // Create a new device
  static async create(userId, deviceData) {
    const { name, description, deviceTypeId, deviceProtocolId, latitude, longitude, locationName, timezone, firmwareVersion } = deviceData;
    
    const id = uuidv4();
    const deviceUuid = `DEV-${uuidv4().substring(0, 8).toUpperCase()}`;
    const mqttUsername = deviceUuid;
    const mqttPassword = uuidv4();
    const mqttPasswordHash = await bcrypt.hash(mqttPassword, 10);
    
    const result = await query(
      `INSERT INTO devices (
        id, user_id, device_type_id, device_protocol_id, device_uuid, name, description,
        mqtt_username, mqtt_password_hash, latitude, longitude, location_name, timezone,
        firmware_version, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'offline')
      RETURNING *`,
      [id, userId, deviceTypeId, deviceProtocolId, deviceUuid, name, description,
       mqttUsername, mqttPasswordHash, latitude, longitude, locationName, timezone, firmwareVersion]
    );
    
    return {
      ...result.rows[0],
      mqttPassword, // Return plain password only once
    };
  }

  // Find device by UUID
  static async findByUuid(deviceUuid) {
    return one(
      `SELECT d.*, dt.name as device_type_name, dt.slug as device_type_slug
       FROM devices d
       LEFT JOIN device_types dt ON dt.id = d.device_type_id
       WHERE d.device_uuid = $1`,
      [deviceUuid]
    );
  }

  // Find device by ID
  static async findById(id, userId = null) {
    let queryText = `
      SELECT d.*, dt.name as device_type_name, dt.slug as device_type_slug,
             dp.name as device_protocol_name, dp.slug as device_protocol_slug
      FROM devices d
      LEFT JOIN device_types dt ON dt.id = d.device_type_id
      LEFT JOIN device_protocols dp ON dp.id = d.device_protocol_id
      WHERE d.id = $1
    `;
    const params = [id];
    
    if (userId) {
      queryText += ' AND d.user_id = $2';
      params.push(userId);
    }
    
    return one(queryText, params);
  }

  // Find device by MQTT credentials
  static async findByMqttCredentials(username) {
    return one(
      `SELECT d.*, u.email as user_email
       FROM devices d
       JOIN users u ON u.id = d.user_id
       WHERE d.mqtt_username = $1 AND d.is_active = true`,
      [username]
    );
  }

  // List user devices
  static async listByUser(userId, options = {}) {
    const { page = 1, limit = 20, status, search, deviceTypeId } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE d.user_id = $1 AND d.is_active = true';
    const params = [userId];
    let paramIndex = 2;
    
    if (status) {
      params.push(status);
      whereClause += ` AND d.status = $${paramIndex}`;
      paramIndex++;
    }
    
    if (deviceTypeId) {
      params.push(deviceTypeId);
      whereClause += ` AND d.device_type_id = $${paramIndex}`;
      paramIndex++;
    }
    
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (d.name ILIKE $${paramIndex} OR d.device_uuid ILIKE $${paramIndex})`;
      paramIndex++;
    }
    
    const devices = await many(
      `SELECT d.*, dt.name as device_type_name, dt.slug as device_type_slug,
              (SELECT json_agg(json_build_object(
                'id', s.id, 'name', s.name, 'identifier', s.identifier,
                'unit', s.unit, 'last_value', sr.value, 'last_timestamp', sr.timestamp
              ))
               FROM sensors s
               LEFT JOIN LATERAL (
                 SELECT value, timestamp FROM sensor_readings
                 WHERE sensor_id = s.id ORDER BY timestamp DESC LIMIT 1
               ) sr ON true
               WHERE s.device_id = d.id AND s.is_active = true
              ) as sensors
       FROM devices d
       LEFT JOIN device_types dt ON dt.id = d.device_type_id
       ${whereClause}
       ORDER BY d.last_seen_at DESC NULLS LAST, d.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );
    
    const total = await count(
      `SELECT COUNT(*) FROM devices d ${whereClause}`,
      params
    );
    
    return {
      devices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update device
  static async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'config' || key === 'metadata' || key === 'tags') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }
    
    values.push(id, userId);
    
    const result = await query(
      `UPDATE devices SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} 
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Update device status
  static async updateStatus(id, status) {
    const lastSeenAt = status === 'online' ? 'CURRENT_TIMESTAMP' : 'last_seen_at';
    
    return one(
      `UPDATE devices SET status = $1, last_seen_at = ${status === 'online' ? 'CURRENT_TIMESTAMP' : 'last_seen_at'}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
  }

  // Delete device (soft delete)
  static async delete(id, userId) {
    return one(
      `UPDATE devices SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
  }

  // Get device statistics
  static async getStats(userId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'online') as online,
        COUNT(*) FILTER (WHERE status = 'offline') as offline,
        COUNT(*) FILTER (WHERE status = 'error') as error
       FROM devices 
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    
    return result.rows[0];
  }

  // Regenerate MQTT credentials
  static async regenerateMqttCredentials(id, userId) {
    const mqttPassword = uuidv4();
    const mqttPasswordHash = await bcrypt.hash(mqttPassword, 10);
    
    const result = await query(
      `UPDATE devices SET mqtt_password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING mqtt_username`,
      [mqttPasswordHash, id, userId]
    );
    
    if (result.rows[0]) {
      return {
        mqttUsername: result.rows[0].mqtt_username,
        mqttPassword,
      };
    }
    return null;
  }

  // Get device types
  static async getDeviceTypes() {
    return many(`SELECT * FROM device_types ORDER BY name`);
  }

  // Get device protocols
  static async getDeviceProtocols() {
    return many(`SELECT * FROM device_protocols ORDER BY name`);
  }
}

export default Device;
