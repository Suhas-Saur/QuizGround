import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Sparkles, BookOpen, Trophy, BarChart3, ShieldCheck, Flame, Users, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [user, navigate]);

  // Mock live quiz preview animation state
  const [previewStep, setPreviewStep] = useState(0);
  const [timerCount, setTimerCount] = useState(15);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const previewQuestions = [
    {
      q: 'Which data structure works on the LIFO principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correct: 1,
      players: [
        { name: 'Rahul', score: 350, change: 0, status: 'idle' },
        { name: 'Ananya', score: 320, change: 0, status: 'idle' },
        { name: 'Arjun', score: 280, change: 0, status: 'idle' }
      ]
    },
    {
      q: 'What is the average time complexity of Binary Search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correct: 2,
      players: [
        { name: 'Ananya', score: 470, change: 150, status: 'correct' },
        { name: 'Rahul', score: 450, change: 100, status: 'correct' },
        { name: 'Arjun', score: 280, change: 0, status: 'incorrect' }
      ]
    }
  ];

  // Control preview animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          // Move to next step of simulation
          setPreviewStep((step) => {
            const nextStep = (step + 1) % 4;
            if (nextStep === 0) {
              setSelectedAns(null);
              return 0;
            }
            if (nextStep === 1) {
              // Student select answer
              setSelectedAns(previewStep === 0 ? 1 : 2);
            }
            return nextStep;
          });
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [previewStep]);

  const currentQ = previewStep < 2 ? previewQuestions[0] : previewQuestions[1];
  const currentLeaderboard = previewStep < 3 ? previewQuestions[0].players : previewQuestions[1].players;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-200">
      {/* Landing Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">⚔️</span>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
            QuizArena
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/join" className="text-sm font-semibold text-slate-600 dark:text-dark-100 hover:text-primary-500">
            Join Room
          </Link>
          <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-dark-100 hover:text-primary-500">
            Sign In
          </Link>
          <Link
            to="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-950/40 px-3 py-1.5 rounded-full text-xs font-semibold text-primary-600 dark:text-primary-400">
            <Sparkles size={14} />
            <span>Gamified Learning Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Turn Learning <br />
            Into a <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">Challenge.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg">
            Create quizzes, host live competitions, practice anywhere, and see exactly how you’re improving. Perfect for teachers, students, and self-learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/join"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <Play size={18} fill="white" />
              <span>Join a Live Quiz</span>
            </Link>
            <Link
              to="/login"
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-dark-800 dark:text-white dark:hover:bg-dark-700 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center transition"
            >
              Start Practicing Mode
            </Link>
          </div>
        </div>

        {/* Live Quiz Preview Animation */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Top Info */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-success rounded-full animate-ping" />
              <span className="text-xs text-slate-400 font-medium">LIVE ROOM SIMULATOR</span>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
              ⏱️ {timerCount}s
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">
              Question {previewStep < 2 ? '1' : '2'} of 2
            </p>
            <h3 className="text-lg font-bold text-slate-100">{currentQ.q}</h3>
          </div>

          {/* Option Grids */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAns === idx;
              const showResult = previewStep === 0 || previewStep === 2 ? false : true;
              const isCorrect = currentQ.correct === idx;

              let btnStyle = 'bg-slate-800 border-slate-700 hover:bg-slate-850';
              if (isSelected && !showResult) btnStyle = 'bg-primary-600 border-primary-500';
              if (showResult && isCorrect) btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
              if (showResult && isSelected && !isCorrect) btnStyle = 'bg-red-600/30 border-red-500 text-red-300';

              return (
                <div
                  key={opt}
                  className={`border p-3.5 rounded-xl text-left text-xs transition duration-200 ${btnStyle}`}
                >
                  <span className="mr-2 font-bold opacity-60">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </div>
              );
            })}
          </div>

          {/* Leaderboard Panel */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left">
            <h4 className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-3">
              Lobby Standings
            </h4>
            <div className="space-y-2">
              {currentLeaderboard.map((player, idx) => (
                <div key={player.name} className="flex items-center justify-between text-xs border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">{idx + 1}.</span>
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold">
                      {player.name.charAt(0)}
                    </div>
                    <span className="font-semibold">{player.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400">{player.score} pts</span>
                    {player.change > 0 && previewStep > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        +{player.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Selector Cards */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-8">
          How do you want to use QuizArena?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-800 rounded-3xl p-8 hover:shadow-xl hover:border-primary-500/30 transition text-left space-y-4">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm">
              🎓
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">I’m a Student</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Practice challenges, join teacher-hosted lobbies, maintain streaks, track performance, and climb the leaderboard with friends.
            </p>
            <Link
              to="/register?role=student"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition"
            >
              Sign Up as Student
            </Link>
          </div>

          {/* Teacher Card */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-800 rounded-3xl p-8 hover:shadow-xl hover:border-indigo-500/30 transition text-left space-y-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm">
              🧑‍🏫
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">I’m a Teacher</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create quizzes quickly using AI, start real-time competition rooms, assign homework, organize classes, and examine performance reports.
            </p>
            <Link
              to="/register?role=teacher"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition"
            >
              Sign Up as Teacher
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Pillar Sections */}
      <div className="bg-white dark:bg-dark-900 border-t border-slate-100 dark:border-dark-800/40 py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Learn. Practice. Compete.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2">
              Our four-step cycle ensures information sticks while maintaining high engagement levels.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2 text-left p-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white">Create</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Instantly generate dynamic, multi-format quizzes tailored to topic and difficulty parameters.
              </p>
            </div>
            <div className="space-y-2 text-left p-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white">Compete</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Join live lobbies with multiplayer components, answering questions with active speed bonuses.
              </p>
            </div>
            <div className="space-y-2 text-left p-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white">Learn</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Obtain immediate correctness assessments backed by detailed teacher-designed explanations.
              </p>
            </div>
            <div className="space-y-2 text-left p-4">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white">Improve</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track personal streaks and examine error reviews on subject-level dashboards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
