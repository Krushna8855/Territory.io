import { GameViewModel } from '../viewmodels/GameViewModel.js';

export class GameController {
  static async getFullState(req, res) {
    try {
      const state = await GameViewModel.getPlayableState();
      res.json(state);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRanking(req, res) {
    try {
      const state = await GameViewModel.getPlayableState();
      res.json(state.leaderboard);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
