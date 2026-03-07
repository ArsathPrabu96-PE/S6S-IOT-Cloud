import { query, one, many } from '../config/database.js';

export class Analytics {
  // Get aggregated sensor data (hourly)
  static async getHourlyData(sensorId, options = {}) {
    const { startTime, endTime, limit = 24 } = options;
    
    const params = [sensorId];
    let paramIndex = 2;
    
    let queryText = `
      SELECT 
        time_bucket('1 hour', timestamp) AS bucket,
        avg(value) as avg_value,
        min(value) as min_value,
        max(value) as max_value,
        count(*) as count,
        stddev(value) as stddev
      FROM sensor_readings
      WHERE sensor_id = $1
    `;
    
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
    
    params.push(limit);
    queryText += `
      GROUP BY bucket 
      ORDER BY bucket DESC
      LIMIT $${paramIndex}
    `;
    
    return many(queryText, params);
  }

  // Get aggregated sensor data (daily)
  static async getDailyData(sensorId, options = {}) {
    const { startTime, endTime, limit = 30 } = options;
    
    const params = [sensorId];
    let paramIndex = 2;
    
    let queryText = `
      SELECT 
        date_trunc('day', timestamp) AS bucket,
        avg(value) as avg_value,
        min(value) as min_value,
        max(value) as max_value,
        count(*) as count,
        stddev(value) as stddev
      FROM sensor_readings
      WHERE sensor_id = $1
    `;
    
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
    
    params.push(limit);
    queryText += `
      GROUP BY bucket 
      ORDER BY bucket DESC
      LIMIT $${paramIndex}
    `;
    
    return many(queryText, params);
  }

  // Get sensor statistics over time
  static async getStats(sensorId, startTime, endTime) {
    return one(
      `SELECT 
        COUNT(*) as count,
        MIN(value) as min,
        MAX(value) as max,
        AVG(value) as avg,
        STDDEV(value) as stddev,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99
       FROM sensor_readings
       WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
      [sensorId, startTime, endTime]
    );
  }

  // Get device analytics
  static async getDeviceAnalytics(deviceId, startDate, endDate) {
    return one(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'online') as online_count,
        COUNT(*) FILTER (WHERE status = 'offline') as offline_count,
        COUNT(*) FILTER (WHERE status = 'error') as error_count
       FROM device_analytics
       WHERE device_id = $1 AND date >= $2 AND date <= $3`,
      [deviceId, startDate, endDate]
    );
  }

  // Get user dashboard analytics
  static async getDashboardAnalytics(userId, options = {}) {
    const { days = 7 } = options;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Device stats
    const deviceStats = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'online') as online,
        COUNT(*) FILTER (WHERE status = 'offline') as offline,
        COUNT(*) FILTER (WHERE status = 'error') as error
       FROM devices 
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    
    // Sensor readings count
    const readingsStats = await query(
      `SELECT COUNT(*) as count
       FROM sensor_readings sr
       JOIN sensors s ON s.id = sr.sensor_id
       JOIN devices d ON d.id = s.device_id
       WHERE d.user_id = $1 AND sr.timestamp >= $2`,
      [userId, startDate]
    );
    
    // Alerts count
    const alertsStats = await query(
      `SELECT COUNT(*) as count
       FROM alerts a
       JOIN devices d ON d.id = a.device_id
       WHERE d.user_id = $1 AND a.created_at >= $2`,
      [userId, startDate]
    );
    
    // Active alerts
    const activeAlerts = await query(
      `SELECT COUNT(*) as count
       FROM alerts a
       JOIN devices d ON d.id = a.device_id
       WHERE d.user_id = $1 AND a.status = 'triggered'`,
      [userId]
    );
    
    return {
      devices: deviceStats.rows[0],
      readings: readingsStats.rows[0].count,
      alerts: alertsStats.rows[0].count,
      activeAlerts: activeAlerts.rows[0].count,
      period: { days, startDate, endDate: new Date() },
    };
  }

  // Get sensor comparison data
  static async compareSensors(sensorIds, startTime, endTime) {
    if (!sensorIds || sensorIds.length === 0) {
      return [];
    }
    
    const placeholders = sensorIds.map((_, i) => `$${i + 2}`).join(', ');
    
    const queryText = `
      SELECT 
        s.id as sensor_id,
        s.name as sensor_name,
        s.identifier,
        s.unit,
        COUNT(sr.id) as reading_count,
        AVG(sr.value) as avg_value,
        MIN(sr.value) as min_value,
        MAX(sr.value) as max_value,
        STDDEV(sr.value) as stddev
      FROM sensors s
      LEFT JOIN sensor_readings sr ON sr.sensor_id = s.id 
        AND sr.timestamp >= $1 AND sr.timestamp <= $2
      WHERE s.id IN (${placeholders})
      GROUP BY s.id, s.name, s.identifier, s.unit
    `;
    
    return many(queryText, [startTime, endTime, ...sensorIds]);
  }

  // Get time series data with fill
  static async getTimeSeriesWithFill(sensorId, options = {}) {
    const { startTime, endTime, interval = '1 hour', fill = 'NULL' } = options;
    
    let fillExpression = 'NULL';
    if (fill === 'previous') {
      fillExpression = 'LOCF';
    } else if (fill === 'linear') {
      fillExpression = 'INTERPOLATE';
    }
    
    return many(
      `SELECT 
        time_bucket('${interval}', timestamp) AS bucket,
        avg(value) as value
      FROM sensor_readings
      WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3
      GROUP BY bucket
      ORDER BY bucket`,
      [sensorId, startTime, endTime]
    );
  }

  // Get trend analysis
  static async getTrendAnalysis(sensorId, options = {}) {
    const { periods = 7, interval = '1 day' } = options;
    
    // Get current period
    const currentEnd = new Date();
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - periods);
    
    // Get previous period
    const previousEnd = new Date(currentStart);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - periods);
    
    const current = await one(
      `SELECT AVG(value) as avg FROM sensor_readings
       WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
      [sensorId, currentStart, currentEnd]
    );
    
    const previous = await one(
      `SELECT AVG(value) as avg FROM sensor_readings
       WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
      [sensorId, previousStart, previousEnd]
    );
    
    const currentCount = await query(
      `SELECT COUNT(*) as count FROM sensor_readings
       WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
      [sensorId, currentStart, currentEnd]
    );
    
    let trend = 'stable';
    let percentChange = 0;
    
    if (previous.avg && current.avg) {
      percentChange = ((current.avg - previous.avg) / previous.avg) * 100;
      if (percentChange > 5) trend = 'increasing';
      else if (percentChange < -5) trend = 'decreasing';
    }
    
    return {
      current: current.avg,
      previous: previous.avg,
      change: current.avg - previous.avg,
      percentChange: percentChange.toFixed(2),
      trend,
      readings: currentCount.rows[0].count,
      period: { periods, interval },
    };
  }

  // Get anomaly detection (simple statistical outlier detection)
  static async detectAnomalies(sensorId, options = {}) {
    const { startTime, endTime, stdDevThreshold = 3 } = options;
    
    return many(
      `SELECT timestamp, value
       FROM sensor_readings
       WHERE sensor_id = $1 
         AND timestamp >= $2 
         AND timestamp <= $3
         AND ABS(value - (SELECT AVG(value) FROM sensor_readings WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3)) > $4 * (SELECT STDDEV(value) FROM sensor_readings WHERE sensor_id = $1 AND timestamp >= $2 AND timestamp <= $3)
       ORDER BY timestamp DESC`,
      [sensorId, startTime, endTime, stdDevThreshold]
    );
  }
}

export default Analytics;
