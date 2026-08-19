import express from 'express';
import { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz, generateAIQuiz, getQuestionBank } from '../controllers/quizController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher'), createQuiz);
router.get('/', getQuizzes);
router.get('/bank', getQuestionBank);
router.get('/:id', getQuizById);
router.put('/:id', authorize('teacher'), updateQuiz);
router.delete('/:id', authorize('teacher'), deleteQuiz);
router.post('/generate', authorize('teacher'), generateAIQuiz);

export default router;
