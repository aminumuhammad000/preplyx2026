import { Router } from 'express';
import { getExams, getExamSubjects, getSubjectCategories, getSubjectIcons, getSubjectTips } from '../controllers/examController';

const router = Router();

router.get('/', getExams);
router.get('/:exam/subjects', getExamSubjects);
router.get('/categories', getSubjectCategories);
router.get('/icons', getSubjectIcons);
router.get('/tips', getSubjectTips);

export default router;