import { Router } from 'express';
import { getQuestions, createQuestion } from '../controllers/questionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getQuestions);
router.post('/', protect, createQuestion); // Depending on requirements, this might be restricted to admin

export default router;
