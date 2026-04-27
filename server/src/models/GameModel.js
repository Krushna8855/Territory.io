import pool from './Database.js';

export class GameModel {
  static async fetchAllBlocks() {
    const result = await pool.query(`
      SELECT b.x, b.y, b.user_id, u.username, u.color 
      FROM blocks b 
      LEFT JOIN users u ON b.user_id = u.id
    `);
    return result.rows;
  }

  static async fetchLeaderboard() {
    const result = await pool.query(`
      SELECT u.id, u.username, u.color, COUNT(b.id) as block_count
      FROM users u
      LEFT JOIN blocks b ON b.user_id = u.id
      GROUP BY u.id, u.username, u.color
      ORDER BY COUNT(b.id) DESC
      LIMIT 20
    `);
    return result.rows;
  }

  static async claimBlock(x, y, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const check = await client.query('SELECT id, user_id FROM blocks WHERE x = $1 AND y = $2', [x, y]);
      
      let blockId;
      if (check.rows.length > 0) {
        if (check.rows[0].user_id === userId) {
          await client.query('ROLLBACK');
          return { success: false, victim: null };
        }
        blockId = check.rows[0].id;
        const victim = await client.query('SELECT id, username FROM users WHERE id = $1', [check.rows[0].user_id]);
        await client.query('UPDATE blocks SET user_id = $1, captured_at = CURRENT_TIMESTAMP WHERE id = $2', [userId, blockId]);
        await client.query('COMMIT');
        return { success: true, victim: victim.rows[0] };
      } else {
        const insert = await client.query('INSERT INTO blocks (x, y, user_id) VALUES ($1, $2, $3) RETURNING id', [x, y, userId]);
        await client.query('COMMIT');
        return { success: true, victim: null };
      }
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findUserById(id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async createNewUser(name, color) {
    const res = await pool.query('INSERT INTO users (username, color) VALUES ($1, $2) RETURNING *', [name, color]);
    return res.rows[0];
  }
}
