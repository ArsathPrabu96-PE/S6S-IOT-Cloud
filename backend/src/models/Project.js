import { v4 as uuidv4 } from 'uuid';
import { query, one, many, count } from '../config/database.js';

export class Project {
  // Create a new project
  static async create(userId, projectData) {
    const { name, description, category, tags } = projectData;
    
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO projects (id, user_id, name, description, category, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [id, userId, name, description, category, JSON.stringify(tags || [])]
    );
    
    return result.rows[0];
  }

  // Find project by ID
  static async findById(id, userId = null) {
    let queryText = `SELECT * FROM projects WHERE id = $1`;
    const params = [id];
    
    if (userId) {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }
    
    return one(queryText, params);
  }

  // List user projects
  static async listByUser(userId, options = {}) {
    const { page = 1, limit = 20, status, search, category } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;
    
    if (status) {
      params.push(status);
      whereClause += ` AND status = $${paramIndex}`;
      paramIndex++;
    }
    
    if (category) {
      params.push(category);
      whereClause += ` AND category = $${paramIndex}`;
      paramIndex++;
    }
    
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      paramIndex++;
    }
    
    const projects = await many(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM devices d WHERE d.project_id = p.id AND d.is_active = true) as device_count
       FROM projects p 
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );
    
    const total = await count(
      `SELECT COUNT(*) FROM projects p ${whereClause}`,
      params
    );
    
    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update project
  static async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'tags') {
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
      `UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} 
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Delete project (soft delete)
  static async delete(id, userId) {
    return one(
      `UPDATE projects SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
  }

  // Get project statistics
  static async getStats(userId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'paused') as paused,
        COUNT(*) FILTER (WHERE category = 'smart_home') as smart_home,
        COUNT(*) FILTER (WHERE category = 'industrial') as industrial,
        COUNT(*) FILTER (WHERE category = 'agriculture') as agriculture,
        COUNT(*) FILTER (WHERE category = 'healthcare') as healthcare
       FROM projects 
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    
    return result.rows[0];
  }

  // Get available project categories
  static async getCategories() {
    return [
      { id: 'smart_home', name: 'Smart Home', icon: '🏠', description: 'Home automation and monitoring' },
      { id: 'industrial', name: 'Industrial IoT', icon: '🏭', description: 'Factory and manufacturing automation' },
      { id: 'agriculture', name: 'Agriculture', icon: '🌱', description: 'Smart farming and crop monitoring' },
      { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Medical device monitoring' },
      { id: 'smart_city', name: 'Smart City', icon: '🏙️', description: 'Urban infrastructure monitoring' },
      { id: 'environmental', name: 'Environmental', icon: '🌍', description: 'Environmental monitoring' },
      { id: 'other', name: 'Other', icon: '📦', description: 'Other IoT projects' },
    ];
  }

  // Get devices by project ID
  static async getDevicesByProject(projectId, userId) {
    const devices = await many(
      `SELECT d.*, dt.name as device_type_name, dt.slug as device_type_slug,
              pd.added_at as project_added_at,
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
       FROM project_devices pd
       JOIN devices d ON d.id = pd.device_id AND d.is_active = true
       LEFT JOIN device_types dt ON dt.id = d.device_type_id
       WHERE pd.project_id = $1
       ORDER BY pd.added_at DESC`,
      [projectId]
    );
    
    return devices;
  }
}

export default Project;
