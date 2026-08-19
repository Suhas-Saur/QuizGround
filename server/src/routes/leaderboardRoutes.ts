import express from 'express';
import { getGlobalLeaderboard, getClassLeaderboard, getWeeklyLeaderboard } from '../controllers/leaderboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/global', getGlobalLeaderboard);
router.get('/class/:classId', getClassLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

export default router;
