import { Router } from 'express';
import { saveSession, getUserSessions, getUserAnalytics, getSessionById, getReviewedQuestions } from '../controllers/examSessionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', protect, saveSession);
router.get('/', protect, getUserSessions);
router.get('/analytics', protect, getUserAnalytics);
router.get('/reviewed-questions', protect, getReviewedQuestions);
router.get('/:id', protect, getSessionById);

export default router;
