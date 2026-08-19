import { Response } from 'express';
import Attempt from '../models/Attempt';
import User from '../models/User';
import Achievement from '../models/Achievement';
import Quiz from '../models/Quiz';
import { AuthRequest } from '../middleware/auth';

// Helper to award badges
const awardBadge = async (studentId: string, badgeType: string): Promise<boolean> => {
  try {
    const existing = await Achievement.findOne({ studentId, type: badgeType });
    if (!existing) {
      await Achievement.create({ studentId, type: badgeType });
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error awarding badge ${badgeType}:`, error);
    return false;
  }
};

// @desc    Submit a quiz attempt (Practice or Homework)
// @route   POST /api/attempts
// @access  Private (Student)
export const createAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  const { quizId, answers, score, accuracy, timeTaken } = req.body;

  if (!quizId || !answers || score === undefined || accuracy === undefined) {
    res.status(400).json({ success: false, message: 'Please provide quizId, answers, score, and accuracy' });
    return;
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    const attempt = await Attempt.create({
      studentId: req.user?._id,
      quizId,
      answers,
      score,
      accuracy,
      timeTaken
    });

    // Gamification Updates for Student
    const user = await User.findById(req.user?._id);
    if (user) {
      const oldXp = user.xp;
      const oldLevel = user.level;

      // Calculate XP earned: 10 XP per correct answer + 50 XP completion bonus + accuracy bonus
      const correctCount = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
      const xpEarned = (correctCount * 10) + 50 + Math.floor(accuracy * 1.5);
      
      user.xp += xpEarned;
      
      // Calculate level (every 1000 XP is a level)
      user.level = Math.floor(user.xp / 1000) + 1;

      // Update streaks
      const now = new Date();
      if (!user.lastStreakUpdate) {
        user.streak = 1;
        user.lastStreakUpdate = now;
      } else {
        const lastDate = new Date(user.lastStreakUpdate);
        
        // Reset hours/minutes/seconds for date comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const lastStreakDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

        if (lastStreakDate.getTime() === yesterday.getTime()) {
          user.streak += 1;
          user.lastStreakUpdate = now;
        } else if (lastStreakDate.getTime() !== today.getTime()) {
          user.streak = 1;
          user.lastStreakUpdate = now;
        }
      }

      await user.save();

      // Trigger Badge Checks
      const newBadges: string[] = [];

      // Badge 1: First Quiz
      const totalAttemptsCount = await Attempt.countDocuments({ studentId: user._id });
      if (totalAttemptsCount === 1) {
        const awarded = await awardBadge(user._id.toString(), 'first_quiz');
        if (awarded) newBadges.push('First Quiz');
      }

      // Badge 2: 10 Quizzes
      if (totalAttemptsCount >= 10) {
        const awarded = await awardBadge(user._id.toString(), '10_quizzes');
        if (awarded) newBadges.push('10 Quizzes');
      }

      // Badge 3: Perfect Score
      if (accuracy === 100) {
        const awarded = await awardBadge(user._id.toString(), 'perfect_score');
        if (awarded) newBadges.push('Perfect Score');
      }

      // Badge 4: Streak Master
      if (user.streak >= 7) {
        const awarded = await awardBadge(user._id.toString(), '7_day_streak');
        if (awarded) newBadges.push('7 Day Streak');
      }

      // Badge 5: Quiz Master
      if (totalAttemptsCount >= 25) {
        const awarded = await awardBadge(user._id.toString(), 'quiz_master');
        if (awarded) newBadges.push('Quiz Master');
      }

      res.status(201).json({
        success: true,
        data: attempt,
        gamification: {
          xpEarned,
          newXp: user.xp,
          levelUp: user.level > oldLevel,
          newLevel: user.level,
          streak: user.streak,
          newBadges
        }
      });
      return;
    }

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error saving attempt', error: (error as Error).message });
  }
};

// @desc    Get my attempts (history)
// @route   GET /api/attempts
// @access  Private (Student)
export const getMyAttempts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempts = await Attempt.find({ studentId: req.user?._id })
      .populate('quizId', 'title subject topic difficulty')
      .sort({ completedAt: -1 });

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving history' });
  }
};

// @desc    Get single attempt details
// @route   GET /api/attempts/:id
// @access  Private
export const getAttemptById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quizId', 'title description subject topic questions settings')
      .populate('studentId', 'name email avatar');

    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt record not found' });
      return;
    }

    // Security check: only the student who completed it or the quiz creator (teacher) can view
    const isOwner = attempt.studentId._id.toString() === req.user?._id.toString();
    
    // Check if the user is a teacher and owns the quiz
    const quiz = attempt.quizId as unknown as { creatorId: mongoose.Types.ObjectId };
    const isTeacherOwner = req.user?.role === 'teacher' && quiz.creatorId.toString() === req.user._id.toString();

    if (!isOwner && !isTeacherOwner) {
      res.status(403).json({ success: false, message: 'Not authorized to view this quiz attempt detail' });
      return;
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving attempt details' });
  }
};
