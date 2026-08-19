import { Response } from 'express';
import Assignment from '../models/Assignment';
import Class from '../models/Class';
import Attempt from '../models/Attempt';
import { AuthRequest } from '../middleware/auth';

// @desc    Assign a quiz to a class (homework)
// @route   POST /api/assignments
// @access  Private (Teacher)
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { quizId, classId, deadline, attemptLimit } = req.body;

  if (!quizId || !classId || !deadline) {
    res.status(400).json({ success: false, message: 'Please provide quizId, classId, and deadline' });
    return;
  }

  try {
    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }

    if (targetClass.teacherId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to assign quizzes to this class' });
      return;
    }

    const assignment = await Assignment.create({
      quizId,
      teacherId: req.user?._id,
      classId,
      studentIds: targetClass.students,
      deadline: new Date(deadline),
      attemptLimit: attemptLimit || 1
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating assignment', error: (error as Error).message });
  }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let assignments;

    if (req.user?.role === 'teacher') {
      assignments = await Assignment.find({ teacherId: req.user._id })
        .populate('quizId', 'title subject topic difficulty')
        .populate('classId', 'name subject');
    } else {
      // Find classes student is enrolled in
      const enrolledClasses = await Class.find({ students: req.user._id });
      const classIds = enrolledClasses.map(c => c._id);

      assignments = await Assignment.find({ classId: { $in: classIds } })
        .populate('quizId', 'title subject topic difficulty questions settings')
        .populate('classId', 'name subject')
        .populate('teacherId', 'name email');
    }

    // Enhance assignments with submission/attempt status for students
    const enhancedAssignments = await Promise.all(
      assignments.map(async (assign) => {
        const assignmentObj = assign.toObject();
        if (req.user?.role === 'student') {
          const attempts = await Attempt.find({
            studentId: req.user._id,
            quizId: assign.quizId instanceof Object ? (assign.quizId as { _id: unknown })._id : assign.quizId
          });
          assignmentObj.attemptsCount = attempts.length;
          assignmentObj.completed = attempts.length >= assign.attemptLimit;
          assignmentObj.bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
        }
        return assignmentObj;
      })
    );

    res.status(200).json({ success: true, data: enhancedAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving assignments', error: (error as Error).message });
  }
};
