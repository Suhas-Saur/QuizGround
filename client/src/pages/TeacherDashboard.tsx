import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Quiz } from '@shared/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, Plus, BookOpen, Users, FileSpreadsheet, Trash2, Calendar, Star, BarChart3, Settings, ShieldCheck } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats Counters
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 12,
    liveSessions: 4,
    avgAccuracy: 78
  });

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        if (res.data.success) {
          setQuizzes(res.data.data);
          setStats(prev => ({
            ...prev,
            totalQuizzes: res.data.data.length
          }));
        }
      } catch (err) {
        console.error('Error fetching teacher dashboard quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleStartLiveSession = async (quizId: string) => {
    try {
      const res = await api.post('/rooms', { quizId, mode: 'classic_live' });
      if (res.data.success) {
        const code = res.data.data.roomCode;
        navigate(`/teacher/host/${code}`);
      }
    } catch (err) {
      console.error('Failed to initialize live room session:', err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await api.delete(`/quizzes/${quizId}`);
      if (res.data.success) {
        setQuizzes(prev => prev.filter(q => q._id !== quizId));
      }
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  // Sample analytics data for Recharts
  const barChartData = [
    { subject: 'Data Structures', accuracy: 82 },
    { subject: 'Algorithms', accuracy: 68 },
    { subject: 'OS', accuracy: 74 },
    { subject: 'Networks', accuracy: 79 },
    { subject: 'DBMS', accuracy: 85 }
  ];

  const lineChartData = [
    { date: 'Aug 12', accuracy: 70 },
    { date: 'Aug 13', accuracy: 73 },
    { date: 'Aug 14', accuracy: 72 },
    { date: 'Aug 15', accuracy: 80 },
    { date: 'Aug 16', accuracy: 78 },
    { date: 'Aug 17', accuracy: 84 }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            Instructor Console
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create quiz sets, manage live classroom rooms, and inspect performance dashboards.
          </p>
        </div>
        <Link
          to="/teacher/create-quiz"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center space-x-1.5 shadow-md transition"
        >
          <Plus size={16} />
          <span>New Quiz Set</span>
        </Link>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quizzes */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quizzes Seeded</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.totalQuizzes}</span>
            <span className="text-xs text-slate-400 font-medium">Sets</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Students Enrolled</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.totalStudents}</span>
            <span className="text-xs text-slate-400 font-medium">Active</span>
          </div>
        </div>

        {/* Live sessions */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Live Rooms Hosted</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.liveSessions}</span>
            <span className="text-xs text-slate-400 font-medium">Sessions</span>
          </div>
        </div>

        {/* Avg Accuracy */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Accuracy</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.avgAccuracy}%</span>
            <span className="text-xs text-emerald-500 font-bold">▲ +4%</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center space-x-2 text-sm">
            <BarChart3 size={18} className="text-indigo-500" />
            <span>Accuracy by Subject Domain</span>
          </h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center space-x-2 text-sm">
            <TrendingUp size={18} className="text-indigo-500" />
            <span>Classroom Performance Timeline</span>
          </h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quizzes List section */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-855 dark:text-white flex items-center space-x-2">
          <BookOpen size={20} className="text-indigo-500" />
          <span>My Quiz Catalog</span>
        </h2>
        
        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-8 rounded-2xl text-center text-slate-400">
            No quizzes created yet. Click "New Quiz Set" to build your first quiz.
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl divide-y divide-slate-100 dark:divide-dark-800 overflow-hidden shadow-sm">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-dark-850/50 transition"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                      {quiz.title}
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded capitalize">
                      {quiz.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-dark-800 px-2 py-0.5 rounded uppercase">
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{quiz.description}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleStartLiveSession(quiz._id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1 shadow-sm transition"
                  >
                    <Play size={12} fill="white" />
                    <span>Live host</span>
                  </button>
                  <Link
                    to={`/teacher/reports/${quiz._id}`}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 dark:text-white text-slate-750 font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1 transition"
                  >
                    <FileSpreadsheet size={12} />
                    <span>Analytics</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="p-2 rounded-xl text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                    title="Delete Quiz"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
