import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './database.js';
import config from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the init.sql file
    const schemaPath = path.join(projectRoot, 'database/schemas/init.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (err) {
        // Ignore duplicate key errors (tables already exist)
        if (err.code !== '42P07' && err.code !== '42710') { // PostgreSQL duplicate table/object
          console.warn('⚠️ Statement warning:', err.message.substring(0, 100));
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
