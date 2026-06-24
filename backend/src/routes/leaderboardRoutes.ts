import { Router } from 'express';
import { getLeaderboard, getUserRank } from '../controllers/leaderboardController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getLeaderboard);
router.get('/me', protect, getUserRank);

export default router;
