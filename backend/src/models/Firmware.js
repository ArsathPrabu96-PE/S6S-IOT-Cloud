import { v4 as uuidv4 } from 'uuid';
import { query, one, many, count } from '../config/database.js';

export class Firmware {
  // Create a new firmware version
  static async create(userId, firmwareData) {
    const { 
      name, version, description, deviceTypeId, fileUrl, fileSize, 
      checksum, buildDate, isStable, isDefault 
    } = firmwareData;
    
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO firmware_versions (
        id, user_id, name, version, description, device_type_id, 
        file_url, file_size, checksum, build_date, is_stable, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [id, userId, name, version, description, deviceTypeId, 
       fileUrl, fileSize, checksum, buildDate, isStable || false, isDefault || false]
    );
    
    return result.rows[0];
  }

  // Get all firmware versions
  static async list(options = {}) {
    const { page = 1, limit = 20, deviceTypeId, isStable } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    
    if (deviceTypeId) {
      params.push(deviceTypeId);
      whereClause = `WHERE device_type_id = $${paramIndex}`;
      paramIndex++;
    }
    
    if (isStable !== undefined) {
      params.push(isStable);
      whereClause += whereClause ? ` AND is_stable = $${paramIndex}` : `WHERE is_stable = $${paramIndex}`;
      paramIndex++;
    }
    
    const firmware = await many(
      `SELECT f.*, dt.name as device_type_name
       FROM firmware_versions f
       LEFT JOIN device_types dt ON dt.id = f.device_type_id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );
    
    const total = await count(
      `SELECT COUNT(*) FROM firmware_versions f ${whereClause}`,
      params
    );
    
    return {
      firmware,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get firmware by ID
  static async findById(id) {
    return one(
      `SELECT f.*, dt.name as device_type_name
       FROM firmware_versions f
       LEFT JOIN device_types dt ON dt.id = f.device_type_id
       WHERE f.id = $1`,
      [id]
    );
  }

  // Get latest firmware for a device type
  static async getLatestForDeviceType(deviceTypeId, isStable = true) {
    return one(
      `SELECT f.*, dt.name as device_type_name
       FROM firmware_versions f
       LEFT JOIN device_types dt ON dt.id = f.device_type_id
       WHERE f.device_type_id = $1 AND f.is_stable = $2
       ORDER BY f.version DESC
       LIMIT 1`,
      [deviceTypeId, isStable]
    );
  }

  // Get default firmware for a device type
  static async getDefaultForDeviceType(deviceTypeId) {
    return one(
      `SELECT f.*, dt.name as device_type_name
       FROM firmware_versions f
       LEFT JOIN device_types dt ON dt.id = f.device_type_id
       WHERE f.device_type_id = $1 AND f.is_default = true
       LIMIT 1`,
      [deviceTypeId]
    );
  }

  // Update firmware
  static async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(id, userId);
    
    const result = await query(
      `UPDATE firmware_versions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Delete firmware
  static async delete(id, userId) {
    return one(
      `UPDATE firmware_versions SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
  }

  // Set firmware as default for device type
  static async setAsDefault(id, userId, deviceTypeId) {
    // First, unset all defaults for this device type
    await query(
      `UPDATE firmware_versions SET is_default = false
       WHERE device_type_id = $1 AND user_id = $2`,
      [deviceTypeId, userId]
    );
    
    // Then set the new default
    return one(
      `UPDATE firmware_versions SET is_default = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
  }

  // Create OTA update record
  static async createUpdate(userId, updateData) {
    const { deviceId, firmwareId, status } = updateData;
    
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO firmware_updates (id, device_id, firmware_id, user_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, deviceId, firmwareId, userId, status || 'pending']
    );
    
    return result.rows[0];
  }

  // Get OTA update status
  static async getUpdateStatus(deviceId) {
    return one(
      `SELECT fu.*, f.name as firmware_name, f.version as firmware_version, f.file_url
       FROM firmware_updates fu
       JOIN firmware_versions f ON f.id = fu.firmware_id
       WHERE fu.device_id = $1
       ORDER BY fu.created_at DESC
       LIMIT 1`,
      [deviceId]
    );
  }

  // Update OTA status
  static async updateStatus(id, status, details = null) {
    const fields = ['status = $1'];
    const params = [status];
    let paramIndex = 2;
    
    if (details) {
      fields.push(`details = $${paramIndex}`);
      params.push(JSON.stringify(details));
      paramIndex++;
    }
    
    if (status === 'completed') {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    } else if (status === 'failed') {
      fields.push(`failed_at = CURRENT_TIMESTAMP`);
    }
    
    params.push(id);
    
    return one(
      `UPDATE firmware_updates SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );
  }

  // Get firmware update history for device
  static async getUpdateHistory(deviceId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    
    return many(
      `SELECT fu.*, f.name as firmware_name, f.version as firmware_version
       FROM firmware_updates fu
       JOIN firmware_versions f ON f.id = fu.firmware_id
       WHERE fu.device_id = $1
       ORDER BY fu.created_at DESC
       LIMIT $2 OFFSET $3`,
      [deviceId, limit, offset]
    );
  }
}

export default Firmware;
