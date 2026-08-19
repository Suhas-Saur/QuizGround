import express from 'express';
import { createRoom, getRoomByCode, joinRoom } from '../controllers/roomController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher'), createRoom);
router.get('/:code', getRoomByCode);
router.post('/:code/join', joinRoom);

export default router;
