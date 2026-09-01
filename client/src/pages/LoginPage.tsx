import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, Mail, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      // Auth context updates user state. Effect inside App/Routes handles redirects,
      // but we can query localStorage/state and directly jump as a fallback.
      const token = localStorage.getItem('token');
      if (token) {
        // Retrieve profile details to check role
        const meRes = await loginCheck();
        if (meRes?.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err: unknown) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantLogin = async (role: 'teacher' | 'student') => {
    const credEmail = role === 'teacher' ? 'teacher@quizarena.com' : 'student@quizarena.com';
    const credPassword = 'password123';
    setEmail(credEmail);
    setPassword(credPassword);
    setError(null);
    setSubmitting(true);

    try {
      await login(credEmail, credPassword);
      if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: unknown) {
      setError('Auto-login failed. Please ensure the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  // Safe inner query to inspect role during login transition
  const loginCheck = async () => {
    try {
      const axios = (await import('../services/api')).default;
      const res = await axios.get('/auth/me');
      return res.data.user;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-8 shadow-xl text-left space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block text-4xl mb-2">
            ⚔️
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue your QuizArena session.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-danger border border-red-200 dark:border-red-800/40 p-3.5 rounded-xl text-sm">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Instant 1-Click Login Options */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Instant Sandbox Login
            </span>
            <span className="text-[10px] text-slate-400 font-medium">1-Click Fast Login</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInstantLogin('teacher')}
              disabled={submitting}
              className="flex items-center space-x-3 p-3.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-400 transition shadow-sm hover:shadow active:scale-95 text-left disabled:opacity-50"
            >
              <span className="text-2xl shrink-0">🧑‍🏫</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Teacher</div>
                <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 truncate">Host & Manage</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleInstantLogin('student')}
              disabled={submitting}
              className="flex items-center space-x-3 p-3.5 rounded-2xl border-2 border-primary-200 dark:border-primary-800/70 bg-primary-50/60 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:border-primary-400 transition shadow-sm hover:shadow active:scale-95 text-left disabled:opacity-50"
            >
              <span className="text-2xl shrink-0">🎓</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-primary-900 dark:text-primary-300">Student</div>
                <div className="text-[10px] text-primary-600/80 dark:text-primary-400/80 truncate">Practice & Play</div>
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-dark-800"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">or login with credentials</span>
          <div className="flex-grow border-t border-slate-200 dark:border-dark-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-dark-800 pt-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p>
            Don't have an account yet?
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register?role=student" className="font-bold text-primary-500 hover:underline">
              Student Register
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/register?role=teacher" className="font-bold text-indigo-500 hover:underline">
              Teacher Register
            </Link>
          </div>
        </div>

        {/* Demo credentials helper card */}
        <div className="bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-dark-800 p-4 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
            <div className="flex items-center space-x-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Default Sandbox Credentials</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Click to autofill & login</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleInstantLogin('teacher')}
              className="w-full text-left p-2 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 hover:border-indigo-400 dark:hover:border-indigo-700 transition flex items-center justify-between group"
            >
              <div className="text-slate-600 dark:text-slate-300">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Teacher:</span> teacher@quizarena.com
              </div>
              <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">Login ➔</span>
            </button>
            <button
              type="button"
              onClick={() => handleInstantLogin('student')}
              className="w-full text-left p-2 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 hover:border-primary-400 dark:hover:border-primary-700 transition flex items-center justify-between group"
            >
              <div className="text-slate-600 dark:text-slate-300">
                <span className="font-bold text-primary-600 dark:text-primary-400">Student:</span> student@quizarena.com
              </div>
              <span className="text-[10px] text-primary-500 font-bold group-hover:underline">Login ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
