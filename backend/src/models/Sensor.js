import { v4 as uuidv4 } from 'uuid';
import { query, one, many, count } from '../config/database.js';

export class Sensor {
  // Create a new sensor
  static async create(deviceId, sensorData) {
    const { 
      name, identifier, unit, dataType, icon, chartType, color,
      minThreshold, maxThreshold, thresholdEnabled 
    } = sensorData;
    
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO sensors (
        id, device_id, name, identifier, unit, data_type, icon,
        chart_type, color, min_threshold, max_threshold, threshold_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [id, deviceId, name, identifier, unit, dataType, icon, chartType, color,
       minThreshold, maxThreshold, thresholdEnabled]
    );
    
    return result.rows[0];
  }

  // Find sensor by ID
  static async findById(id, userId = null) {
    let queryText = `
      SELECT s.*, d.name as device_name, d.device_uuid, d.user_id
      FROM sensors s
      JOIN devices d ON d.id = s.device_id
      WHERE s.id = $1
    `;
    const params = [id];
    
    if (userId) {
      queryText += ' AND d.user_id = $2';
      params.push(userId);
    }
    
    return one(queryText, params);
  }

  // Find sensor by device and identifier
  static async findByDeviceAndIdentifier(deviceId, identifier) {
    return one(
      `SELECT * FROM sensors WHERE device_id = $1 AND identifier = $2 AND is_active = true`,
      [deviceId, identifier]
    );
  }

  // List sensors by device
  static async listByDevice(deviceId, userId = null) {
    let queryText = `
      SELECT s.*, 
             sr.value as last_value, 
             sr.timestamp as last_timestamp,
             sr.quality as last_quality
      FROM sensors s
      LEFT JOIN LATERAL (
        SELECT value, timestamp, quality 
        FROM sensor_readings 
        WHERE sensor_id = s.id 
        ORDER BY timestamp DESC 
        LIMIT 1
      ) sr ON true
      WHERE s.device_id = $1 AND s.is_active = true
    `;
    const params = [deviceId];
    
    if (userId) {
      queryText += ` AND s.device_id IN (SELECT id FROM devices WHERE user_id = $2 AND is_active = true)`;
      params.push(userId);
    }
    
    queryText += ' ORDER BY s.name';
    
    return many(queryText, params);
  }

  // Update sensor
  static async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(id, userId);
    
    const result = await query(
      `UPDATE sensors SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} AND device_id IN (SELECT id FROM devices WHERE user_id = $${paramIndex + 1})
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Delete sensor
  static async delete(id, userId) {
    return one(
      `UPDATE sensors SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND device_id IN (SELECT id FROM devices WHERE user_id = $2)
       RETURNING id`,
      [id, userId]
    );
  }

  // Add sensor reading
  static async addReading(sensorId, deviceId, value, quality = 100) {
    const result = await query(
      `INSERT INTO sensor_readings (sensor_id, device_id, value, quality)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sensorId, deviceId, value, quality]
    );
    
    return result.rows[0];
  }

  // Add multiple sensor readings (batch)
  static async addReadingsBatch(readings) {
    if (!readings.length) return [];
    
    const values = [];
    const params = [];
    let paramIndex = 1;
    
    for (const reading of readings) {
      values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
      params.push(reading.sensorId, reading.deviceId, reading.value, reading.quality || 100);
      paramIndex += 4;
    }
    
    const result = await query(
      `INSERT INTO sensor_readings (sensor_id, device_id, value, quality)
       VALUES ${values.join(', ')}
       RETURNING *`,
      params
    );
    
    return result.rows;
  }

  // Get sensor readings
  static async getReadings(sensorId, options = {}) {
    const { startTime, endTime, limit = 100, interval = null } = options;
    
    let queryText = '';
    const params = [sensorId];
    let paramIndex = 2;
    
    // If interval is specified, use time bucketing
    if (interval) {
      const intervalMs = interval * 1000; // interval in seconds
      queryText = `
        SELECT 
          time_bucket('${interval} seconds', timestamp) AS bucket,
          avg(value) as value,
          min(value) as min_value,
          max(value) as max_value,
          count(*) as count
        FROM sensor_readings
        WHERE sensor_id = $1
      `;
    } else {
      queryText = `
        SELECT id, sensor_id, value, quality, timestamp
        FROM sensor_readings
        WHERE sensor_id = $1
      `;
    }
    
    if (startTime) {
      params.push(startTime);
      queryText += ` AND timestamp >= $${paramIndex}`;
      paramIndex++;
    }
    
    if (endTime) {
      params.push(endTime);
      queryText += ` AND timestamp <= $${paramIndex}`;
      paramIndex++;
    }
    
    if (interval) {
      queryText += ` GROUP BY bucket ORDER BY bucket`;
    } else {
      queryText += ` ORDER BY timestamp DESC`;
    }
    
    params.push(limit);
    queryText += ` LIMIT $${paramIndex}`;
    
    return many(queryText, params);
  }

  // Get latest reading
  static async getLatestReading(sensorId) {
    return one(
      `SELECT * FROM sensor_readings 
       WHERE sensor_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [sensorId]
    );
  }

  // Get aggregated readings for a device
  static async getDeviceReadings(deviceId, options = {}) {
    const { startTime, endTime, limit = 100 } = options;
    
    let queryText = `
      SELECT 
        sr.sensor_id,
        s.identifier,
        s.name as sensor_name,
        s.unit,
        sr.value,
        sr.timestamp
      FROM sensor_readings sr
      JOIN sensors s ON s.id = sr.sensor_id
      WHERE sr.device_id = $1
    `;
    const params = [deviceId];
    let paramIndex = 2;
    
    if (startTime) {
      params.push(startTime);
      queryText += ` AND sr.timestamp >= $${paramIndex}`;
      paramIndex++;
    }
    
    if (endTime) {
      params.push(endTime);
      queryText += ` AND sr.timestamp <= $${paramIndex}`;
      paramIndex++;
    }
    
    params.push(limit);
    queryText += ` ORDER BY sr.timestamp DESC LIMIT $${paramIndex}`;
    
    return many(queryText, params);
  }

  // Check threshold and return alert if triggered
  static async checkThreshold(sensorId, value) {
    const sensor = await one(
      `SELECT * FROM sensors WHERE id = $1 AND threshold_enabled = true`,
      [sensorId]
    );
    
    if (!sensor) return null;
    
    let alertType = null;
    let thresholdValue = null;
    
    if (sensor.min_threshold !== null && value < sensor.min_threshold) {
      alertType = 'below_minimum';
      thresholdValue = sensor.min_threshold;
    } else if (sensor.max_threshold !== null && value > sensor.max_threshold) {
      alertType = 'above_maximum';
      thresholdValue = sensor.max_threshold;
    }
    
    if (alertType) {
      return {
        sensor,
        alertType,
        value,
        thresholdValue,
      };
    }
    
    return null;
  }

  // Get statistics for sensor
  static async getStats(sensorId, startTime, endTime) {
    return one(
      `SELECT 
        COUNT(*) as count,
        MIN(value) as min,
        MAX(value) as max,
        AVG(value) as avg,
        STDDEV(value) as stddev
       FROM sensor_readings
       WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
      [sensorId, startTime, endTime]
    );
  }
}

export default Sensor;
