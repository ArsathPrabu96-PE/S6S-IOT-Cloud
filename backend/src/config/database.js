import pg from 'pg';
import config from './index.js';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password || '',
  max: config.db.poolSize,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Query helper
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (config.isDev) {
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
  }
  
  return res;
};

// Transaction helper
export const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get single row
export const one = async (text, params) => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

// Get multiple rows
export const many = async (text, params) => {
  const result = await query(text, params);
  return result.rows;
};

// Get count
export const count = async (text, params) => {
  const result = await query(text, params);
  return parseInt(result.rows[0]?.count || '0', 10);
};

export default pool;
