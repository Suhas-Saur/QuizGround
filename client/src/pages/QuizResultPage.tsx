import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { Attempt } from '@shared/types';
import { Award, Trophy, Timer, CheckCircle, XCircle, ArrowLeft, RotateCcw, LayoutDashboard, Flame, ChevronDown, ChevronUp } from 'lucide-react';

export const QuizResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Extract navigation states (gamification rewards)
  const gamification = location.state?.gamification;

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}`);
        if (res.data.success) {
          setAttempt(res.data.data);
        }
      } catch (err) {
        setError('Failed to load attempt results');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Compiling performance aggregates...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="bg-red-50 text-danger p-6 rounded-2xl border border-red-200 text-center">
        <h3 className="font-bold">Error</h3>
        <p className="text-sm mt-1">Failed to read results record.</p>
        <Link to="/student/dashboard" className="text-xs font-bold text-primary-500 underline mt-2 block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const qQuiz = attempt.quizId as unknown as { title: string; subject: string; questions: { question: string; options: string[]; correctAnswer: string | string[]; explanation?: string }[] };
  
  const correctCount = attempt.answers.filter(a => a.isCorrect).length;
  const incorrectCount = attempt.answers.length - correctCount;

  // Format time (seconds -> mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 text-left">
      
      {/* Quiz Completion Banner */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-6">
        <div className="space-y-2">
          <span className="text-5xl">🎉</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Quiz Complete!
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            {qQuiz?.title || 'Practice Quiz'}
          </p>
        </div>

        {/* Gamification Level-Up/XP Awards box */}
        {gamification && (
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl text-left space-y-3 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <Trophy size={18} />
              <span>Session Rewards Earned</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2 bg-white dark:bg-dark-900 p-2.5 rounded-xl border border-slate-100 dark:border-dark-800">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-slate-400">XP Gained</p>
                  <p className="font-extrabold text-slate-800 dark:text-white">+{gamification.xpEarned} XP</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white dark:bg-dark-900 p-2.5 rounded-xl border border-slate-100 dark:border-dark-800">
                <Flame className="text-amber-500 animate-pulse" size={18} />
                <div>
                  <p className="text-slate-400">Streak Status</p>
                  <p className="font-extrabold text-slate-800 dark:text-white">{gamification.streak} Days</p>
                </div>
              </div>
            </div>

            {/* Level up notifier */}
            {gamification.levelUp && (
              <div className="bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold p-2.5 rounded-xl text-center">
                ✨ LEVEL UP! You reached Level {gamification.newLevel}! ✨
              </div>
            )}

            {/* Unlocked Badges */}
            {gamification.newBadges && gamification.newBadges.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Badges Unlocked</p>
                <div className="flex gap-2">
                  {gamification.newBadges.map((badge: string) => (
                    <span key={badge} className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      🏅 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accuracy Circles & Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {/* Accuracy Card */}
          <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-2xl flex flex-col items-center">
            <Award className="text-primary-500 mb-1" size={20} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{attempt.accuracy}%</span>
          </div>

          {/* Score Card */}
          <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-2xl flex flex-col items-center">
            <CheckCircle className="text-emerald-500 mb-1" size={20} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Correct</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{correctCount} / {attempt.answers.length}</span>
          </div>

          {/* Time Taken Card */}
          <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-2xl flex flex-col items-center">
            <Timer className="text-violet-500 mb-1" size={20} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{formatTime(attempt.timeTaken)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-4">
          <Link
            to={`/student/practice/play/${attempt.quizId instanceof Object ? (attempt.quizId as { _id: string })._id : attempt.quizId}`}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
          >
            <RotateCcw size={14} />
            <span>Practice Again</span>
          </Link>
          <Link
            to="/student/dashboard"
            className="bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:text-white dark:hover:bg-dark-755 font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Accordion Questions Review Panel */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
        <button
          onClick={() => setReviewOpen(!reviewOpen)}
          className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-slate-700 dark:text-white"
        >
          <span>Detailed Answers Review</span>
          {reviewOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {reviewOpen && (
          <div className="border-t border-slate-100 dark:border-dark-800 p-6 space-y-6">
            {qQuiz?.questions.map((quest, index) => {
              const matchingAns = attempt.answers.find(a => a.questionIndex === index);
              const studAns = matchingAns ? matchingAns.studentAnswer : '';
              const corrAns = quest.correctAnswer;
              const isCorrect = matchingAns ? matchingAns.isCorrect : false;

              return (
                <div key={index} className="space-y-3 pb-6 border-b border-slate-100 dark:border-dark-800/80 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                      Question {index + 1}: {quest.question}
                    </h4>
                    {isCorrect ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full uppercase shrink-0">Correct</span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full uppercase shrink-0">Incorrect</span>
                    )}
                  </div>

                  {/* Options logs */}
                  <div className="space-y-1.5 pl-2 text-xs">
                    <p className="text-slate-500">
                      <strong>Your Answer:</strong>{' '}
                      <span className={isCorrect ? 'text-emerald-500 font-bold' : 'text-red-500'}>
                        {Array.isArray(studAns) ? studAns.join(', ') : studAns.toString() || '(Skipped)'}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      <strong>Correct Answer:</strong>{' '}
                      <span className="text-emerald-600 font-bold">
                        {Array.isArray(corrAns) ? corrAns.join(', ') : corrAns.toString()}
                      </span>
                    </p>
                  </div>

                  {/* Explanations block */}
                  <div className="bg-slate-50 dark:bg-dark-850 p-3.5 rounded-xl border border-slate-100 dark:border-dark-800 text-xs text-slate-500 dark:text-dark-300">
                    <p className="font-bold mb-1">Explanation:</p>
                    <p className="leading-relaxed">{quest.explanation || 'No explanation provided.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
