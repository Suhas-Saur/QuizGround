import express from 'express';
import { createAttempt, getMyAttempts, getAttemptById } from '../controllers/attemptController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), createAttempt);
router.get('/', getMyAttempts);
router.get('/:id', getAttemptById);

export default router;
