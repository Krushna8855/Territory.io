import pg from 'pg';
import dotenv from 'dotenv';
import { GRID_WIDTH, GRID_HEIGHT } from '../../../shared/constants.js';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

export const getGridState = async () => {
  const result = await pool.query(`
    SELECT b.x, b.y, b.user_id, u.username, u.color 
    FROM blocks b 
    LEFT JOIN users u ON b.user_id = u.id
  `);
  
  const blocks = {};
  result.rows.forEach(row => {
    blocks[`${row.x},${row.y}`] = {
      x: row.x,
      y: row.y,
      userId: row.user_id,
      username: row.username,
      color: row.color
    };
  });
  
  return { blocks, width: GRID_WIDTH, height: GRID_HEIGHT };
};

export const getLeaderboard = async () => {
  const result = await pool.query(`
    SELECT u.id, u.username, u.color, COUNT(b.id) as block_count
    FROM users u
    LEFT JOIN blocks b ON b.user_id = u.id
    GROUP BY u.id, u.username, u.color
    ORDER BY COUNT(b.id) DESC
    LIMIT 20
  `);
  return result.rows;
};

export const getStats = async () => {
  const totalBlocks = await pool.query('SELECT COUNT(*) as count FROM blocks WHERE user_id IS NOT NULL');
  const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
  
  return {
    totalBlocks: parseInt(totalBlocks.rows[0].count),
    totalUsers: parseInt(totalUsers.rows[0].count),
    gridSize: GRID_WIDTH * GRID_HEIGHT
  };
};

export const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (username, color) => {
  const result = await pool.query(
    'INSERT INTO users (username, color) VALUES ($1, $2) RETURNING *',
    [username, color]
  );
  return result.rows[0];
};

export const captureBlock = async (x, y, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const checkResult = await client.query(
      'SELECT id, user_id FROM blocks WHERE x = $1 AND y = $2',
      [x, y]
    );
    
    let blockId;
    if (checkResult.rows.length > 0) {
      if (checkResult.rows[0].user_id === userId) {
        await client.query('ROLLBACK');
        return { success: false, message: 'You already own this block' };
      }
      blockId = checkResult.rows[0].id;
      await client.query(
        'UPDATE blocks SET user_id = $1, captured_at = CURRENT_TIMESTAMP WHERE id = $2',
        [userId, blockId]
      );
    } else {
      const insertResult = await client.query(
        'INSERT INTO blocks (x, y, user_id) VALUES ($1, $2, $3) RETURNING id',
        [x, y, userId]
      );
      blockId = insertResult.rows[0].id;
    }
    
    await client.query(
      'INSERT INTO capture_log (block_id, user_id) VALUES ($1, $2)',
      [blockId, userId]
    );
    
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const captureArea = async (centerX, centerY, radius, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const capturedBlocks = [];

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) continue;

        const checkResult = await client.query(
          'SELECT id FROM blocks WHERE x = $1 AND y = $2',
          [x, y]
        );

        let blockId;
        if (checkResult.rows.length > 0) {
          blockId = checkResult.rows[0].id;
          await client.query(
            'UPDATE blocks SET user_id = $1, captured_at = CURRENT_TIMESTAMP WHERE id = $2',
            [userId, blockId]
          );
        } else {
          const insertResult = await client.query(
            'INSERT INTO blocks (x, y, user_id) VALUES ($1, $2, $3) RETURNING id',
            [x, y, userId]
          );
          blockId = insertResult.rows[0].id;
        }
        
        capturedBlocks.push({ x, y });
      }
    }

    await client.query('COMMIT');
    return { success: true, capturedBlocks };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};