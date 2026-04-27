import express from 'express';
import * as gridStore from '../store/gridStore.js';

const router = express.Router();

router.get('/state', async (req, res) => {
  try {
    const state = await gridStore.getGridState();
    res.json(state);
  } catch (error) {
    console.error('API Error (/state):', error);
    res.status(500).json({ error: 'Failed to fetch grid state' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await gridStore.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('API Error (/leaderboard):', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await gridStore.getStats();
    res.json(stats);
  } catch (error) {
    console.error('API Error (/stats):', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;