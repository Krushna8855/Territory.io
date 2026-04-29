import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const schema = `
-- Drop existing tables to ensure a clean state
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table with Password support
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  color VARCHAR(20) NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Blocks Table
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(x, y)
);

CREATE INDEX idx_blocks_coords ON blocks(x, y);
`;

async function init() {
  const client = await pool.connect();
  try {
    console.log('🏗️  Initializing Database Schema...');
    await client.query(schema);
    console.log('✅ Database Schema Initialized Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

init();
