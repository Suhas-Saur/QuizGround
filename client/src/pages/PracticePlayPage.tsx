import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Quiz, Question } from '@shared/types';
import { Play, ArrowRight, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export const PracticePlayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz Play States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Handles multiple select and choices
  const [textAnswer, setTextAnswer] = useState(''); // Handles fill in the blank
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(30);

  // Accumulated States for submission
  const [score, setScore] = useState(0);
  const [attemptsList, setAttemptsList] = useState<any[]>([]);
  const [quizStartTime] = useState<number>(Date.now());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (res.data.success) {
          setQuiz(res.data.data);
          if (res.data.data.settings.timerDuration) {
            setTimer(res.data.data.settings.timerDuration);
          }
        }
      } catch (err) {
        setError('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Timer loop
  useEffect(() => {
    if (loading || isAnswered || !quiz) return;

    if (quiz.settings.timerMode === 'off') return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswered, loading, quiz]);

  const handleAutoSubmit = () => {
    // If timer expires, submit whatever is currently selected, or blank
    if (isAnswered) return;
    handleSubmitAnswer();
  };

  const handleOptionToggle = (opt: string) => {
    if (isAnswered) return;

    const q = quiz?.questions[currentIndex];
    if (!q) return;

    if (q.type === 'multiple_select') {
      setSelectedAnswers((prev) => {
        if (prev.includes(opt)) {
          return prev.filter(a => a !== opt);
        } else {
          return [...prev, opt];
        }
      });
    } else {
      setSelectedAnswers([opt]);
    }
  };

  const handleSubmitAnswer = () => {
    if (isAnswered || !quiz) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const q = quiz.questions[currentIndex];
    let correct = false;
    let studentAnswer: string | string[] = '';

    if (q.type === 'multiple_select') {
      studentAnswer = [...selectedAnswers];
      if (Array.isArray(q.correctAnswer)) {
        const sortedCorr = [...q.correctAnswer].sort();
        const sortedAns = [...selectedAnswers].sort();
        correct = sortedCorr.length === sortedAns.length && sortedCorr.every((v, i) => v === sortedAns[i]);
      }
    } else if (q.type === 'fill_in_the_blank') {
      studentAnswer = textAnswer.trim();
      if (typeof q.correctAnswer === 'string') {
        correct = studentAnswer.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      } else if (Array.isArray(q.correctAnswer)) {
        // Support multiple acceptable options
        correct = q.correctAnswer.some(ans => studentAnswer.toString().toLowerCase() === ans.trim().toLowerCase());
      }
    } else {
      studentAnswer = selectedAnswers[0] || '';
      if (typeof q.correctAnswer === 'string') {
        correct = studentAnswer.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }
    }

    const earned = correct ? q.points : 0;
    setIsCorrect(correct);
    setScore(prev => prev + earned);
    setIsAnswered(true);

    // Track attempt logs
    setAttemptsList((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        questionId: q._id,
        studentAnswer,
        isCorrect: correct,
        pointsEarned: earned,
        timeTaken: quiz.settings.timerDuration - timer
      }
    ]);
  };

  const handleNext = async () => {
    if (!quiz) return;

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setTextAnswer('');
      setIsAnswered(false);
      setTimer(quiz.settings.timerDuration || 30);
    } else {
      // End of quiz, submit attempts
      await handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    if (!quiz) return;

    setLoading(true);
    const totalQuestions = quiz.questions.length;
    const correctAnswersCount = attemptsList.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctAnswersCount / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);

    try {
      const attemptPayload = {
        quizId: quiz._id,
        answers: attemptsList,
        score,
        accuracy,
        timeTaken
      };

      const res = await api.post('/attempts', attemptPayload);
      if (res.data.success) {
        const attemptId = res.data.data._id;
        navigate(`/student/practice/results/${attemptId}`, {
          state: { gamification: res.data.gamification }
        });
      }
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      setError('Failed to submit results. Redirecting back...');
      setTimeout(() => navigate('/student/dashboard'), 3000);
    }
  };

  if (loading && !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading quiz gameplay environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-danger p-6 rounded-2xl border border-red-200 text-center">
        <AlertCircle className="mx-auto mb-2 text-danger" size={32} />
        <h3 className="font-bold">Play Error</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 text-left">
      
      {/* Quiz Progress header */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>{quiz.title}</span>
          <div className="flex items-center space-x-1.5 text-primary-500">
            <span>Score: {score} pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-dark-800 h-2 rounded-full overflow-hidden">
            <div className="bg-primary-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Gameplay card container */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        
        {/* Timer count & Category */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded uppercase tracking-wider">
            {currentQuestion.difficulty} • {currentQuestion.points} pts
          </span>
          {quiz.settings.timerMode !== 'off' && !isAnswered && (
            <div className={`flex items-center space-x-1.5 font-bold text-sm px-3 py-1 rounded-full ${
              timer < 7 ? 'text-danger bg-red-50 dark:bg-red-950/20 animate-pulse' : 'text-slate-500 dark:text-dark-300'
            }`}>
              <Clock size={16} />
              <span>⏱️ {timer}s</span>
            </div>
          )}
        </div>

        {/* Question text */}
        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Question Options depending on type */}
        <div className="space-y-3">
          {currentQuestion.type === 'fill_in_the_blank' ? (
            <div className="space-y-2">
              <input
                type="text"
                disabled={isAnswered}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your response here..."
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 rounded-xl py-3.5 px-4 text-sm outline-none transition"
              />
            </div>
          ) : (
            <div className="grid gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers.includes(opt);
                const isCorrectOption = Array.isArray(currentQuestion.correctAnswer)
                  ? currentQuestion.correctAnswer.includes(opt)
                  : currentQuestion.correctAnswer.trim().toLowerCase() === opt.trim().toLowerCase();

                let style = 'bg-slate-50 border-slate-200 dark:bg-dark-950 dark:border-dark-800 hover:bg-slate-100/50';
                
                if (isSelected) {
                  style = 'bg-primary-50 border-primary-500 dark:bg-primary-950/40';
                }

                if (isAnswered) {
                  if (isCorrectOption) {
                    style = 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-300 font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    style = 'bg-red-50 border-red-500 dark:bg-red-950/20 text-red-600 dark:text-red-300';
                  } else {
                    style = 'opacity-50 border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950';
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={isAnswered}
                    onClick={() => handleOptionToggle(opt)}
                    className={`w-full border p-4 rounded-xl flex items-center justify-between transition duration-200 text-left text-sm ${style}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrectOption && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                    {isAnswered && isSelected && !isCorrectOption && <XCircle size={16} className="text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        {!isAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={
              currentQuestion.type === 'fill_in_the_blank'
                ? !textAnswer.trim()
                : selectedAnswers.length === 0
            }
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
          >
            <span>Submit Answer</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-dark-800 animate-fadeIn">
            {/* Feedback alert */}
            <div className={`p-4 rounded-2xl flex items-start space-x-3 border ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800/40 dark:text-red-300'
            }`}>
              {isCorrect ? (
                <CheckCircle2 size={20} className="shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <XCircle size={20} className="shrink-0 text-red-500 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm">{isCorrect ? 'Correct!' : 'Incorrect Answer'}</h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {currentQuestion.explanation || 'No explanation provided for this question.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2"
            >
              <span>{currentIndex + 1 === quiz.questions.length ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
