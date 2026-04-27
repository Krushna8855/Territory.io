import express from 'express';
import { GameController } from '../controllers/GameController.js';

const router = express.Router();

router.get('/state', GameController.getFullState);
router.get('/leaderboard', GameController.getRanking);

export default router;