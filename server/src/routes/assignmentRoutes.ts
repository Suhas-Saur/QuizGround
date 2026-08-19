import express from 'express';
import { createAssignment, getAssignments } from '../controllers/assignmentController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher'), createAssignment);
router.get('/', getAssignments);

export default router;
