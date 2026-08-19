import { Response } from 'express';
import Room from '../models/Room';
import Quiz from '../models/Quiz';
import { AuthRequest } from '../middleware/auth';

const generateUniqueCode = async (): Promise<string> => {
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingRoom = await Room.findOne({ roomCode: code, status: { $ne: 'COMPLETED' } });
    if (!existingRoom) {
      isUnique = true;
    }
  }
  
  return code;
};

// @desc    Create a new live room
// @route   POST /api/rooms
// @access  Private (Teacher)
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const { quizId, mode, timerDuration, showLeaderboardEveryQuestion } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    const roomCode = await generateUniqueCode();

    const room = await Room.create({
      roomCode,
      quizId,
      teacherId: req.user?._id,
      status: 'WAITING',
      currentQuestionIndex: -1,
      participants: [],
      settings: {
        mode: mode || 'classic_live',
        timerDuration: timerDuration || quiz.settings.timerDuration || 30,
        showLeaderboardEveryQuestion: showLeaderboardEveryQuestion !== undefined ? showLeaderboardEveryQuestion : true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: room._id,
        roomCode: room.roomCode,
        quizTitle: quiz.title,
        status: room.status,
        settings: room.settings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating live room', error: (error as Error).message });
  }
};

// @desc    Get room details by code
// @route   GET /api/rooms/:code
// @access  Private
export const getRoomByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code })
      .populate('quizId', 'title description subject questions settings')
      .populate('teacherId', 'name email');

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room.status === 'COMPLETED') {
      res.status(400).json({ success: false, message: 'This room has already completed' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: room._id,
        roomCode: room.roomCode,
        status: room.status,
        currentQuestionIndex: room.currentQuestionIndex,
        settings: room.settings,
        quiz: {
          id: (room.quizId as unknown as { _id: string })._id,
          title: (room.quizId as unknown as { title: string }).title,
          subject: (room.quizId as unknown as { subject: string }).subject,
          questionsCount: (room.quizId as unknown as { questions: unknown[] }).questions.length
        },
        teacher: {
          name: (room.teacherId as unknown as { name: string }).name
        },
        participantsCount: room.participants.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving room details' });
  }
};

// @desc    Validate code and authorize join
// @route   POST /api/rooms/:code/join
// @access  Private (Student)
export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room.status === 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Room has already ended' });
      return;
    }

    if (room.status !== 'WAITING' && !room.quizId.toString()) { // check if late joining is disabled
      // Fetch quiz details for setting
      const quiz = await Quiz.findById(room.quizId);
      if (quiz && !quiz.settings.allowLateJoining) {
        res.status(400).json({ success: false, message: 'Late joining is disabled for this quiz' });
        return;
      }
    }

    // Return confirmation. The actual socket connection handles inserting the student.
    res.status(200).json({
      success: true,
      message: 'Lobby is valid. Proceed to connect socket.',
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        status: room.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error joining room' });
  }
};
