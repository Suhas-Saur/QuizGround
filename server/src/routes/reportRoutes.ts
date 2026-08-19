import express from 'express';
import { getQuizReport } from '../controllers/reportController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/:quizId', authorize('teacher'), getQuizReport);

export default router;
