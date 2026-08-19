import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Mail, KeyRound, Building2, BookCheck, GraduationCap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerStudent, registerTeacher } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Student Specific
  const [institution, setInstitution] = useState('');
  const [className, setClassName] = useState(''); // E.g. B.Tech CSE
  const [yearGrade, setYearGrade] = useState(''); // E.g. 3rd Year

  // Teacher Specific
  const [subject, setSubject] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      if (role === 'student') {
        await registerStudent({
          name,
          email,
          password,
          institution,
          className,
          subject: yearGrade // Mapping grade/year to subject column
        });
        navigate('/student/dashboard');
      } else {
        await registerTeacher({
          name,
          email,
          password,
          institution,
          subject,
          teacherId
        });
        navigate('/teacher/dashboard');
      }
    } catch (err: unknown) {
      setError('Registration failed. Email might already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-8 shadow-xl text-left space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block text-4xl mb-2">
            ⚔️
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white capitalize">
            Create {role} Account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign up to get started on QuizArena today.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-danger border border-red-200 dark:border-red-800/40 p-3.5 rounded-xl text-sm">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
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
                placeholder="john@example.com"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Common Institution field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
              {role === 'student' ? 'College / School Name' : 'Teaching Institution'}
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="LPU University"
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                    Class / Course
                  </label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="B.Tech CSE"
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-9 pr-3 text-xs outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                    Year / Grade
                  </label>
                  <div className="relative">
                    <BookCheck size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={yearGrade}
                      onChange={(e) => setYearGrade(e.target.value)}
                      placeholder="3rd Year"
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-9 pr-3 text-xs outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Teacher Specific Fields */}
          {role === 'teacher' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                    Subject
                  </label>
                  <div className="relative">
                    <BookCheck size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Data Structures"
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-9 pr-3 text-xs outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                    Teacher ID
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      placeholder="T-9872"
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-9 pr-3 text-xs outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound size={14} className="absolute left-3 top-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3.5 pl-9 pr-3 text-xs outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound size={14} className="absolute left-3 top-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3.5 pl-9 pr-3 text-xs outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm mt-4"
          >
            {submitting ? 'Registering...' : `Register as ${role}`}
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-dark-800 pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-500 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
