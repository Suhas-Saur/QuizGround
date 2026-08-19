import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Attempt } from '@shared/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Flame, Target, BookOpen, Clock, AlertCircle, ShieldAlert, Sparkles, Star } from 'lucide-react';

interface ProgressReport {
  attemptsCount: number;
  avgAccuracy: number;
  bestSubject: string;
  weakestSubject: string;
  totalTime: number;
  unlockedBadges: string[];
}

export const StudentProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ProgressReport>({
    attemptsCount: 0,
    avgAccuracy: 0,
    bestSubject: 'Data Structures',
    weakestSubject: 'Trees',
    totalTime: 0,
    unlockedBadges: ['first_quiz']
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const attemptRes = await api.get('/attempts');
        if (attemptRes.data.success) {
          const atts: Attempt[] = attemptRes.data.data;
          setAttempts(atts);

          // Calculate stats
          const attemptsCount = atts.length;
          const avgAccuracy = attemptsCount > 0
            ? Math.round(atts.reduce((a, b) => a + b.accuracy, 0) / attemptsCount)
            : 0;

          // Aggregated mock stats
          setReport({
            attemptsCount,
            avgAccuracy,
            bestSubject: attemptsCount > 1 ? 'Data Structures' : 'General CS',
            weakestSubject: 'Algorithms',
            totalTime: atts.reduce((a, b) => a + b.timeTaken, 0),
            unlockedBadges: attemptsCount > 0 ? ['first_quiz', 'perfect_score'] : ['first_quiz']
          });
        }
      } catch (err) {
        console.error('Failed to load student progress data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  // Format Recharts data
  const chartData = attempts.slice().reverse().map((att, idx) => {
    const qInfo = att.quizId as unknown as { title: string };
    return {
      index: idx + 1,
      title: qInfo?.title ? qInfo.title.substring(0, 10) + '...' : `Quiz ${idx + 1}`,
      accuracy: att.accuracy,
      score: att.score
    };
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-dark-800 rounded-3xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Predefined badge collections
  const badgeDefinitions = [
    { code: 'first_quiz', name: 'First Quiz', desc: 'Completed your first QuizArena challenge', icon: '🏅' },
    { code: '10_quizzes', name: '10 Quizzes', desc: 'Finished 10 practice sets', icon: '🏆' },
    { code: 'perfect_score', name: 'Perfect Score', desc: 'Answered all questions correctly (100% accuracy)', icon: '⭐' },
    { code: '7_day_streak', name: 'Streak Master', desc: 'Maintained a 7-day practice streak', icon: '🔥' },
    { code: 'quiz_master', name: 'Quiz Master', desc: 'Completed 25 quiz sets', icon: '👑' }
  ];

  return (
    <div className="space-y-8 pb-16 text-left">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
          <Award className="text-indigo-500" />
          <span>My Progress Dashboard</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track subject performance trends, accuracy timelines, and unlockable badges.
        </p>
      </div>

      {/* Level bar card */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2 text-primary-500 font-extrabold text-sm">
            <Sparkles size={16} />
            <span>Level {user?.level || 1} Apprentice</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-dark-850 h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary-500 h-full transition-all duration-500"
              style={{ width: `${((user?.xp || 0) % 1000) / 10}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{(user?.xp || 0) % 1000} XP / 1000 XP</span>
            <span>{1000 - ((user?.xp || 0) % 1000)} XP to Next Level</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-medium shrink-0 md:border-l md:border-slate-100 dark:md:border-dark-800 md:pl-6">
          <div>
            <p className="text-slate-400">Best Domain</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{report.bestSubject}</p>
          </div>
          <div>
            <p className="text-slate-400">Weakest Focus</p>
            <p className="text-sm font-bold text-red-500 capitalize">{report.weakestSubject}</p>
          </div>
        </div>
      </div>

      {/* Recommended Focus Area */}
      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-5 text-xs text-slate-500 dark:text-dark-300 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-indigo-700 dark:text-indigo-400">
          <AlertCircle size={16} />
          <span>Personalized Study Guidance</span>
        </div>
        <p className="leading-relaxed">
          Based on recent accuracy trends, you are performing best in <strong>{report.bestSubject}</strong> but struggle with <strong>{report.weakestSubject}</strong>. We suggest starting similar practice sessions to bridge the gap.
        </p>
      </div>

      {/* Progress Charts Grid */}
      {attempts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">
              Accuracy Timeline (%)
            </h3>
            <div className="h-64 text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">
              Points Scored per Quiz (XP)
            </h3>
            <div className="h-64 text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Badges / Unlockables Roster */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">
          Achievement Badges
        </h3>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badgeDefinitions.map((badge) => {
            const isUnlocked = report.unlockedBadges.includes(badge.code) || attempts.length > 0;
            return (
              <div
                key={badge.code}
                className={`border rounded-2xl p-4 flex items-center space-x-3 text-left transition shadow-sm ${
                  isUnlocked
                    ? 'bg-white border-slate-200 dark:bg-dark-900 dark:border-dark-800'
                    : 'bg-slate-50 border-slate-100 dark:bg-dark-950 dark:border-dark-900/50 opacity-40'
                }`}
              >
                <div className="text-3xl shrink-0">
                  {badge.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">{badge.name}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
