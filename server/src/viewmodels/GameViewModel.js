import { GameModel } from '../models/GameModel.js';
import { GRID_W, GRID_H } from '../../../shared/constants.js';

export class GameViewModel {
  static async getPlayableState() {
    const rows = await GameModel.fetchAllBlocks();
    const blocks = {};
    
    rows.forEach(row => {
      blocks[`${row.x},${row.y}`] = {
        x: row.x,
        y: row.y,
        userId: row.user_id,
        username: row.username,
        color: row.color
      };
    });

    const leaderboard = await GameModel.fetchLeaderboard();
    
    return {
      grid: {
        blocks,
        width: GRID_W,
        height: GRID_H
      },
      leaderboard
    };
  }

  static async handleClaim(x, y, userId) {
    // Business logic check before DB
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) {
      throw new Error('Coordinates out of bounds');
    }

    return await GameModel.claimBlock(x, y, userId);
  }

  static async syncUser(id) {
    return await GameModel.findUserById(id);
  }

  static async onboardUser(name, color) {
    // Validation logic
    if (!name || name.length < 3) throw new Error('Name too short');
    return await GameModel.createNewUser(name, color);
  }
}
