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

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

async function runDemo() {
  const client = await pool.connect();
  try {
    console.log('🧹 Clearing old data...');
    await client.query('TRUNCATE users, blocks RESTART IDENTITY CASCADE');

    console.log('👥 Registering 20 Unique Players...');
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const username = `Player_${i.toString().padStart(2, '0')}`;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const password = `pass123`;
      
      const res = await client.query(
        'INSERT INTO users (username, color, password) VALUES ($1, $2, $3) RETURNING *',
        [username, color, password]
      );
      users.push(res.rows[0]);
    }
    console.log('✅ 20 Players Registered.');

    console.log('🚫 Testing Duplicate Name Prevention...');
    try {
      await client.query(
        'INSERT INTO users (username, color, password) VALUES ($1, $2, $3)',
        ['Player_01', '#000000', 'pass123']
      );
      console.log('❌ ERROR: Duplicate name was allowed (This should not happen!)');
    } catch (e) {
      console.log('✅ Success: Duplicate name blocked as expected.');
    }

    console.log('⚔️ Simulating Battlefield Conquest (500 Tiles)...');
    for (let i = 0; i < 500; i++) {
      const x = Math.floor(Math.random() * 50);
      const y = Math.floor(Math.random() * 30);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      await client.query(
        'INSERT INTO blocks (x, y, user_id) VALUES ($1, $2, $3) ON CONFLICT (x, y) DO UPDATE SET user_id = $3',
        [x, y, randomUser.id]
      );
    }
    console.log('✅ Battlefield Initialized.');

    console.log('\n📊 FINAL DATABASE AUDIT:');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const blockCount = await client.query('SELECT COUNT(*) FROM blocks');
    const topPlayer = await client.query(`
      SELECT u.username, COUNT(b.id) as score 
      FROM users u 
      JOIN blocks b ON b.user_id = u.id 
      GROUP BY u.username 
      ORDER BY score DESC LIMIT 1
    `);

    console.log(`- Total Users: ${userCount.rows[0].count}`);
    console.log(`- Total Blocks: ${blockCount.rows[0].count}`);
    console.log(`- Current King: ${topPlayer.rows[0].username} with ${topPlayer.rows[0].score} blocks`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Demo Population Failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

runDemo();
