import { Response } from 'express';
import Class from '../models/Class';
import { AuthRequest } from '../middleware/auth';

const generateUniqueClassCode = async (): Promise<string> => {
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingClass = await Class.findOne({ joinCode: code });
    if (!existingClass) {
      isUnique = true;
    }
  }
  
  return code;
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teacher)
export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, subject } = req.body;

  if (!name || !subject) {
    res.status(400).json({ success: false, message: 'Please provide class name and subject' });
    return;
  }

  try {
    const joinCode = await generateUniqueClassCode();

    const newClass = await Class.create({
      teacherId: req.user?._id,
      name,
      subject,
      joinCode,
      students: []
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating class', error: (error as Error).message });
  }
};

// @desc    Get user classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let classes;

    if (req.user?.role === 'teacher') {
      classes = await Class.find({ teacherId: req.user._id }).populate('students', 'name email avatar');
    } else {
      classes = await Class.find({ students: req.user?._id }).populate('teacherId', 'name email');
    }

    const classesWithCount = classes.map(c => ({
      ...c.toObject(),
      studentCount: c.students.length
    }));

    res.status(200).json({ success: true, data: classesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving classes' });
  }
};

// @desc    Join class using joinCode
// @route   POST /api/classes/join
// @access  Private (Student)
export const joinClass = async (req: AuthRequest, res: Response): Promise<void> => {
  const { joinCode } = req.body;

  if (!joinCode) {
    res.status(400).json({ success: false, message: 'Please provide a class join code' });
    return;
  }

  try {
    const targetClass = await Class.findOne({ joinCode: joinCode.toUpperCase() });
    if (!targetClass) {
      res.status(404).json({ success: false, message: 'Class not found with this code' });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (targetClass.students.includes(req.user._id)) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this class' });
      return;
    }

    targetClass.students.push(req.user._id);
    await targetClass.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the class',
      data: {
        id: targetClass._id,
        name: targetClass.name,
        subject: targetClass.subject
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error joining class' });
  }
};
