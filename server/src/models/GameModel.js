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
      LIMIT 50
    `);
    return result.rows;
  }

  static async claimBlock(x, y, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const check = await client.query('SELECT id, user_id, captured_at FROM blocks WHERE x = $1 AND y = $2', [x, y]);
      
      let blockId;
      if (check.rows.length > 0) {
        // SHIELD PROTECTION: 5-second lock
        const lastCaptured = new Date(check.rows[0].captured_at).getTime();
        const now = Date.now();
        if (now - lastCaptured < 5000) {
          await client.query('ROLLBACK');
          return { success: false, error: 'SHIELD_ACTIVE' };
        }

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

  static async claimArea(centerX, centerY, radius, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const captured = [];
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;
          
          if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
          
          // No shield check for nukes - nukes bypass shields for total destruction!
          await client.query(`
            INSERT INTO blocks (x, y, user_id) 
            VALUES ($1, $2, $3)
            ON CONFLICT (x, y) DO UPDATE SET user_id = $3, captured_at = CURRENT_TIMESTAMP
          `, [x, y, userId]);
          
          captured.push({ x, y });
        }
      }
      
      await client.query('COMMIT');
      return { success: true, blocks: captured };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findUserByUsername(username) {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
  }

  static async findUserById(id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async createNewUser(name, color, password) {
    const res = await pool.query(
      'INSERT INTO users (username, color, password, xp, level) VALUES ($1, $2, $3, 0, 1) RETURNING *', 
      [name, color, password]
    );
    return res.rows[0];
  }

  static async addXP(userId, amount) {
    const res = await pool.query(`
      UPDATE users 
      SET xp = xp + $1,
          level = 1 + FLOOR((xp + $1) / 1000)
      WHERE id = $2
      RETURNING xp, level
    `, [amount, userId]);
    return res.rows[0];
  }
}
