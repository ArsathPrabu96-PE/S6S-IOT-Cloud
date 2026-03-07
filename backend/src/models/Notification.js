import { v4 as uuidv4 } from 'uuid';
import { query, one, many, count } from '../config/database.js';

export class Notification {
  // Create a new notification
  static async create(userId, notificationData) {
    const { 
      type, title, message, data, priority, channel 
    } = notificationData;
    
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO notifications (
        id, user_id, type, title, message, data, priority, channel
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [id, userId, type, title, message, data ? JSON.stringify(data) : '{}', priority || 'normal', channel]
    );
    
    return result.rows[0];
  }

  // Get notifications for a user
  static async getForUser(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false, type } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;
    
    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }
    
    if (type) {
      params.push(type);
      whereClause += ` AND type = $${paramIndex}`;
      paramIndex++;
    }
    
    const notifications = await many(
      `SELECT * FROM notifications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );
    
    const total = await count(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      params
    );
    
    const unreadCount = await count(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    
    return {
      notifications,
      unreadCount: parseInt(unreadCount),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mark notification as read
  static async markAsRead(id, userId) {
    return one(
      `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    return query(
      `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  }

  // Delete notification
  static async delete(id, userId) {
    return one(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
  }

  // Delete all read notifications
  static async deleteRead(userId) {
    return query(
      `DELETE FROM notifications WHERE user_id = $1 AND is_read = true`,
      [userId]
    );
  }

  // Get unread count
  static async getUnreadCount(userId) {
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Create alert notification (from threshold)
  static async createAlert(alertData) {
    const { userId, deviceId, sensorId, title, message, severity, value, thresholdValue } = alertData;
    
    return Notification.create(userId, {
      type: 'alert',
      title,
      message,
      data: {
        deviceId,
        sensorId,
        value,
        thresholdValue,
        severity,
      },
      priority: severity === 'critical' ? 'high' : 'normal',
      channel: 'in_app',
    });
  }

  // Create device notification
  static async createDeviceNotification(userId, deviceId, title, message, severity = 'normal') {
    return Notification.create(userId, {
      type: 'device',
      title,
      message,
      data: { deviceId },
      priority: severity,
      channel: 'in_app',
    });
  }

  // Create system notification
  static async createSystemNotification(userId, title, message, severity = 'normal') {
    return Notification.create(userId, {
      type: 'system',
      title,
      message,
      data: {},
      priority: severity,
      channel: 'in_app',
    });
  }
}

export default Notification;
