import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'quizarena_super_secret_jwt_key_987654321', {
    expiresIn: '30d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register/student
// @access  Public
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, institution, className, subject } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'student',
      institution: institution || '',
      class: className || '',
      subject: subject || '', // Maps to year/grade
      avatar: `avatar${Math.floor(Math.random() * 8) + 1}`,
      xp: 0,
      level: 1,
      streak: 0
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        class: user.class,
        subject: user.subject,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during student registration', error: (error as Error).message });
  }
};

// @desc    Register a new teacher
// @route   POST /api/auth/register/teacher
// @access  Public
export const registerTeacher = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, institution, subject, teacherId } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'teacher',
      institution: institution || '',
      subject: subject || '',
      class: teacherId || '', // Store teacherId under class or ignore
      avatar: `teacher_avatar_${Math.floor(Math.random() * 4) + 1}`,
      xp: 0,
      level: 1,
      streak: 0
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        subject: user.subject,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during teacher registration', error: (error as Error).message });
  }
};

// @desc    Login user (student or teacher)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check if user has streak to update
    let updatedStreak = user.streak;
    const now = new Date();
    if (user.role === 'student' && user.lastStreakUpdate) {
      const diffTime = Math.abs(now.getTime() - new Date(user.lastStreakUpdate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        // Streak broken
        user.streak = 0;
        updatedStreak = 0;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        class: user.class,
        subject: user.subject,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streak: updatedStreak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: (error as Error).message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        institution: req.user.institution,
        class: req.user.class,
        subject: req.user.subject,
        avatar: req.user.avatar,
        xp: req.user.xp,
        level: req.user.level,
        streak: req.user.streak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving current user info' });
  }
};
