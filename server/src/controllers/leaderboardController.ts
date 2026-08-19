import { Request, Response } from 'express';
import User from '../models/User';
import Class from '../models/Class';

// @desc    Get global leaderboard (ordered by XP)
// @route   GET /api/leaderboards/global
// @access  Public
export const getGlobalLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name avatar xp level institution streak')
      .sort({ xp: -1 })
      .limit(50);

    const ranked = students.map((s, index) => ({
      rank: index + 1,
      id: s._id,
      name: s.name,
      avatar: s.avatar,
      xp: s.xp,
      level: s.level,
      streak: s.streak,
      institution: s.institution
    }));

    res.status(200).json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving global leaderboard' });
  }
};

// @desc    Get leaderboard for a specific class
// @route   GET /api/leaderboards/class/:classId
// @access  Private
export const getClassLeaderboard = async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;

  try {
    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }

    const students = await User.find({ _id: { $in: targetClass.students } })
      .select('name avatar xp level institution streak')
      .sort({ xp: -1 });

    const ranked = students.map((s, index) => ({
      rank: index + 1,
      id: s._id,
      name: s.name,
      avatar: s.avatar,
      xp: s.xp,
      level: s.level,
      streak: s.streak
    }));

    res.status(200).json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving class leaderboard' });
  }
};

// @desc    Get weekly trending leaderboard
// @route   GET /api/leaderboards/weekly
// @access  Public
export const getWeeklyLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // For local demo, we can sort by streak + a hashed factor to simulate weekly score
    const students = await User.find({ role: 'student' })
      .select('name avatar xp level streak institution')
      .limit(20);

    const weeklyData = students.map((s) => {
      // Create a deterministic mock weekly XP score based on streak and overall XP
      const weeklyXp = (s.streak * 50) + Math.min(s.xp, 800) + (s.name.charCodeAt(0) * 2);
      return {
        id: s._id,
        name: s.name,
        avatar: s.avatar,
        weeklyXp,
        level: s.level,
        streak: s.streak,
        institution: s.institution
      };
    });

    weeklyData.sort((a, b) => b.weeklyXp - a.weeklyXp);

    const ranked = weeklyData.map((s, index) => ({
      rank: index + 1,
      ...s
    }));

    res.status(200).json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving weekly leaderboard' });
  }
};
