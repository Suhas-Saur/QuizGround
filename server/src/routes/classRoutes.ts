import express from 'express';
import { createClass, getClasses, joinClass } from '../controllers/classController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher'), createClass);
router.get('/', getClasses);
router.post('/join', authorize('student'), joinClass);

export default router;
