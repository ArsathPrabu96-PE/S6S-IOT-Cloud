import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, one, many, count } from '../config/database.js';

export class User {
  // Create a new user
  static async create(userData) {
    const { email, password, firstName, lastName, company, phone, role } = userData;
    
    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, company, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, company, phone, is_active, is_verified, created_at`,
      [id, email, passwordHash, firstName, lastName, company, phone]
    );
    
    // Assign default role
    if (result.rows[0]) {
      await User.assignRole(id, role || 'user');
    }
    
    return result.rows[0];
  }

  // Assign role to user
  static async assignRole(userId, roleName) {
    const role = await one(
      `SELECT id FROM roles WHERE name = $1`,
      [roleName]
    );
    
    if (role) {
      await query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, role.id]
      );
    }
  }

  // Get user roles
  static async getRoles(userId) {
    return many(
      `SELECT r.* FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId]
    );
  }

  // Check if user has role
  static async hasRole(userId, roleName) {
    const result = await query(
      `SELECT COUNT(*) FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND r.name = $2`,
      [userId, roleName]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // Get user with roles
  static async findById(id) {
    const user = await one(
      `SELECT id, email, first_name, last_name, company, phone, avatar_url, 
              is_active, is_verified, email_verified_at, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    
    if (user) {
      user.roles = await User.getRoles(id);
      user.permissions = await User.getPermissions(id);
    }
    
    return user;
  }

  // Get user permissions based on roles
  static async getPermissions(userId) {
    const permissions = await many(
      `SELECT DISTINCT p.* FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    return permissions.map(p => p.name);
  }

  // Check if user has specific permission
  static async hasPermission(userId, permission) {
    const result = await query(
      `SELECT COUNT(*) FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = $1 AND p.name = $2`,
      [userId, permission]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // Find user by email
  static async findByEmail(email) {
    return one(
      `SELECT id, email, password_hash, first_name, last_name, company, phone, 
              avatar_url, is_active, is_verified, email_verified_at, created_at
       FROM users WHERE email = $1`,
      [email]
    );
  }

  // Update user
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} 
       RETURNING id, email, first_name, last_name, company, phone, avatar_url, is_active`,
      values
    );
    
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  // Get user subscription
  static async getSubscription(userId) {
    return one(
      `SELECT s.id, s.status, s.billing_cycle, s.started_at, s.expires_at,
              sp.name as plan_name, sp.slug as plan_slug, sp.max_devices, 
              sp.max_data_retention_days
       FROM subscriptions s
       JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active'`,
      [userId]
    );
  }

  // Get user device count
  static async getDeviceCount(userId) {
    const result = await query(
      `SELECT COUNT(*) as count FROM devices WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // List users (admin)
  static async list(options = {}) {
    const { page = 1, limit = 20, search } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE email ILIKE $${params.length} OR first_name ILIKE $${params.length} OR last_name ILIKE $${params.length}`;
    }
    
    const users = await many(
      `SELECT id, email, first_name, last_name, company, is_active, is_verified, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    
    const total = await count(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default User;
