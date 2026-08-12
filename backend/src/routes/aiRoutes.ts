import { Router } from 'express';
import { askAiTutor } from '../controllers/aiController';

const router = Router();

router.post('/tutor', askAiTutor);

export default router;
