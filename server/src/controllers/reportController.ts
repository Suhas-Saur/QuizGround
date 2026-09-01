import { Response } from 'express';
import Quiz from '../models/Quiz';
import Attempt from '../models/Attempt';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Get report analytics for a specific quiz
// @route   GET /api/reports/:quizId
// @access  Private (Teacher)
export const getQuizReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    // Verify ownership
    if (quiz.creatorId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view reports for this quiz' });
      return;
    }

    // Find all attempts for this quiz
    const attempts = await Attempt.find({ quizId }).populate('studentId', 'name email avatar institution');

    if (attempts.length === 0) {
      res.status(200).json({
        success: true,
        summary: {
          participantsCount: 0,
          averageScore: 0,
          averageAccuracy: 0,
          completionRate: 0,
          highestScore: 0,
          lowestScore: 0,
          averageTime: 0
        },
        questionsAnalysis: [],
        studentsAnalysis: []
      });
      return;
    }

    // Calculate Summary Metrics
    const participantsCount = attempts.length;
    const scores = attempts.map(a => a.score);
    const accuracies = attempts.map(a => a.accuracy);
    const times = attempts.map(a => a.timeTaken);

    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / participantsCount);
    const averageAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / participantsCount);
    const averageTime = Math.round(times.reduce((a, b) => a + b, 0) / participantsCount);

    // Students Analysis
    const studentsAnalysis = attempts.map((a, index) => {
      const student = a.studentId as unknown as { name: string; email: string; avatar: string; institution: string };
      return {
        id: a._id,
        studentName: student?.name || 'Student',
        studentEmail: student?.email || 'N/A',
        studentAvatar: student?.avatar || 'avatar1',
        institution: student?.institution || 'N/A',
        score: a.score,
        accuracy: a.accuracy,
        timeTaken: a.timeTaken,
        completedAt: a.completedAt
      };
    });

    // Sort students analysis by score descending
    studentsAnalysis.sort((a, b) => b.score - a.score);

    // Question Analysis
    const questionsAnalysis = quiz.questions.map((q, qIndex) => {
      let correctAnswersCount = 0;
      let totalResponsesCount = 0;
      let totalTimeSpent = 0;

      attempts.forEach((a) => {
        const matchingAns = a.answers.find(ans => ans.questionIndex === qIndex || ans.questionId.toString() === (q as any)._id?.toString());
        if (matchingAns) {
          totalResponsesCount++;
          totalTimeSpent += matchingAns.timeTaken;
          if (matchingAns.isCorrect) {
            correctAnswersCount++;
          }
        }
      });

      const accuracy = totalResponsesCount > 0 ? Math.round((correctAnswersCount / totalResponsesCount) * 100) : 0;
      const averageResponseTime = totalResponsesCount > 0 ? Math.round((totalTimeSpent / totalResponsesCount) * 10) / 10 : 0;

      return {
        questionId: (q as any)._id,
        questionText: q.question,
        type: q.type,
        difficulty: q.difficulty,
        correctCount: correctAnswersCount,
        incorrectCount: totalResponsesCount - correctAnswersCount,
        accuracy,
        averageResponseTime
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        participantsCount,
        averageScore,
        averageAccuracy,
        highestScore,
        lowestScore,
        averageTime
      },
      questionsAnalysis,
      studentsAnalysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error generating quiz reports', error: (error as Error).message });
  }
};
