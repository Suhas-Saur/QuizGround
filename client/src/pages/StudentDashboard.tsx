import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Quiz, Attempt } from '@shared/types';
import {
  Flame,
  Award,
  BookOpen,
  Trophy,
  History,
  TrendingUp,
  Target,
  Play,
  Dribbble,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [quizRes, attemptRes, leadRes] = await Promise.all([
          api.get('/quizzes?published=true'),
          api.get('/attempts'),
          api.get('/leaderboards/global')
        ]);
        
        if (quizRes.data.success) setQuizzes(quizRes.data.data);
        if (attemptRes.data.success) setAttempts(attemptRes.data.data);
        if (leadRes.data.success) setLeaderboard(leadRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute overall stats
  const totalXP = user?.xp || 0;
  const currentStreak = user?.streak || 0;
  const quizzesCompleted = attempts.length;
  const averageAccuracy = quizzesCompleted > 0
    ? Math.round(attempts.reduce((a, b) => a + b.accuracy, 0) / quizzesCompleted)
    : 0;

  // Find user global rank
  const myRank = leaderboard.find(l => l.name === user?.name)?.rank || '12';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-3xl md:col-span-2" />
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Pick suggestions
  const recommendedQuizzes = quizzes.slice(0, 3);
  const popularQuizzes = quizzes.slice(Math.min(3, quizzes.length - 3), Math.min(6, quizzes.length));
  const recentResults = attempts.slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 opacity-10 font-bold text-[180px]">⚔️</div>
        <div className="relative z-10 text-left space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={14} className="text-amber-300" />
            <span>Welcome back, {user?.name}!</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to test your knowledge?
          </h1>
          <p className="text-slate-100/90 text-sm max-w-md">
            Review your streak, challenge classmates, or start a practice session to level up.
          </p>
          <div className="flex space-x-3 pt-2">
            <Link
              to="/join"
              className="bg-white text-indigo-700 hover:bg-slate-50 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md active:scale-95"
            >
              Join Live Session
            </Link>
            <Link
              to="/student/practice"
              className="bg-indigo-500/40 hover:bg-indigo-500/60 border border-indigo-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition active:scale-95"
            >
              Start Practice
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Fast Action Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 select-none">
        <Link
          to="/join"
          className="shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <span className="text-base">🎮</span>
          <span>Join Live PIN</span>
        </Link>
        <Link
          to="/student/practice"
          className="shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 active:scale-95 transition"
        >
          <span className="text-base">🚀</span>
          <span>Quick Practice</span>
        </Link>
        <Link
          to="/student/leaderboard"
          className="shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-white font-bold text-xs shadow-sm active:scale-95 transition"
        >
          <span className="text-base">🏆</span>
          <span>Ranks & Badges</span>
        </Link>
        <Link
          to="/student/progress"
          className="shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-white font-bold text-xs shadow-sm active:scale-95 transition"
        >
          <span className="text-base">🔥</span>
          <span>Streak: {currentStreak}d</span>
        </Link>
      </div>

      {/* Quick Gamification Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 rounded-2xl p-4 flex items-center space-x-4 shadow-sm text-left">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl flex items-center justify-center font-bold text-2xl">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Practice Streak</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{currentStreak} Days</h3>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 rounded-2xl p-4 flex items-center space-x-4 shadow-sm text-left">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-xl flex items-center justify-center font-bold text-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Experience</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{totalXP} XP</h3>
          </div>
        </div>

        {/* Quizzes Completed */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 rounded-2xl p-4 flex items-center space-x-4 shadow-sm text-left">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold text-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quizzes Completed</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{quizzesCompleted} Games</h3>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 rounded-2xl p-4 flex items-center space-x-4 shadow-sm text-left">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/20 text-violet-500 rounded-xl flex items-center justify-center font-bold text-2xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Accuracy</p>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{averageAccuracy}%</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Left lists, Right sidebar info */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Challenge */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4 text-left">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <span>Daily Challenge</span>
                  <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">MANDATORY</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete today's coding structures puzzle and receive double XP rewards.
                </p>
              </div>
            </div>
            {quizzes.length > 0 && (
              <Link
                to={`/student/practice/play/${quizzes[0]._id}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition shrink-0 text-center"
              >
                Accept Challenge
              </Link>
            )}
          </div>

          {/* Suggested Practice */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
                <TrendingUp size={20} className="text-primary-500" />
                <span>Recommended Practice</span>
              </h2>
              <Link to="/student/practice" className="text-xs font-semibold text-primary-500 hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recommendedQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 hover:shadow-md transition text-left flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded-md uppercase">
                        {quiz.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        quiz.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' :
                        quiz.difficulty === 'medium' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white truncate">{quiz.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{quiz.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-dark-800">
                    <span className="text-[10px] text-slate-400">{quiz.questions.length} Questions</span>
                    <Link
                      to={`/student/practice/play/${quiz._id}`}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-bold p-2 rounded-lg text-xs flex items-center justify-center"
                      title="Start Practice"
                    >
                      <Play size={12} fill="white" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent History */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
              <History size={20} className="text-violet-500" />
              <span>Recent Attempt Results</span>
            </h2>
            {recentResults.length === 0 ? (
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-8 rounded-2xl text-center text-slate-400">
                You haven't completed any practice quizzes yet.
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl divide-y divide-slate-100 dark:divide-dark-800 overflow-hidden shadow-sm">
                {recentResults.map((att) => {
                  const qInfo = att.quizId as unknown as { title: string; subject: string };
                  return (
                    <div
                      key={att._id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-850 transition text-left"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <h4 className="font-bold text-slate-800 dark:text-white truncate">
                          {qInfo?.title || 'Unknown Quiz'}
                        </h4>
                        <p className="text-xs text-slate-400 capitalize">{qInfo?.subject || 'Practice'}</p>
                      </div>
                      <div className="flex items-center space-x-6 text-right shrink-0">
                        <div>
                          <p className="text-xs text-slate-400">Accuracy</p>
                          <p className="text-sm font-extrabold text-emerald-500">{att.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Score</p>
                          <p className="text-sm font-extrabold text-primary-500">{att.score} XP</p>
                        </div>
                        <Link
                          to={`/student/practice/results/${att._id}`}
                          className="text-xs text-indigo-500 font-bold hover:underline"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Leaderboard widget */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 rounded-3xl p-5 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-850 dark:text-white flex items-center space-x-2">
                <Trophy size={18} className="text-amber-500" />
                <span>Global Rankings</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">Your Rank: #{myRank}</span>
            </div>
            <div className="space-y-3 pt-2">
              {leaderboard.map((userRow) => {
                const isMe = userRow.name === user?.name;
                return (
                  <div
                    key={userRow.name}
                    className={`flex items-center justify-between p-2 rounded-xl border ${
                      isMe
                        ? 'bg-primary-50 border-primary-200 dark:bg-primary-950/20 dark:border-primary-900/60'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 text-xs font-bold text-slate-400">{userRow.rank}.</span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-850 flex items-center justify-center font-bold text-xs">
                        {userRow.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-xs font-bold truncate max-w-[120px] ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-dark-100'}`}>
                        {userRow.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-dark-300">
                      {userRow.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              to="/student/leaderboard"
              className="block w-full text-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-dark-200 transition"
            >
              Full Standings
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
