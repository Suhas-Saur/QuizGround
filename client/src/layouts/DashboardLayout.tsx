import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen,
  LayoutDashboard,
  Trophy,
  Users,
  FileSpreadsheet,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Play,
  User,
  PlusCircle,
  Bell
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const teacherItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'My Quizzes', path: '/teacher/quizzes', icon: BookOpen },
    { name: 'Create Quiz', path: '/teacher/create-quiz', icon: PlusCircle },
    { name: 'Classes', path: '/teacher/classes', icon: Users },
    { name: 'Reports & Analytics', path: '/teacher/reports', icon: FileSpreadsheet }
  ];

  const studentNavItems = [
    { name: 'Home', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Practice', path: '/student/practice', icon: BookOpen },
    { name: 'Join Quiz', path: '/join', icon: Play },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'My Progress', path: '/student/progress', icon: User }
  ];

  const sidebarItems = user?.role === 'teacher' ? teacherItems : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwapRole = async () => {
    const isTeacher = user?.role === 'teacher';
    const targetEmail = isTeacher ? 'student@quizarena.com' : 'teacher@quizarena.com';
    try {
      await login(targetEmail, 'password123');
      navigate(isTeacher ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err) {
      console.error('Swap role failed:', err);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user?.role === 'teacher' && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-dark-100 dark:hover:bg-dark-800"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
                QuizArena
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Switch Role developer shortcut */}
            <button
              onClick={handleSwapRole}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center space-x-1 transition-colors"
              title={`Switch to ${user?.role === 'teacher' ? 'Student' : 'Teacher'} account`}
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Switch Role</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            {/* Notification bell */}
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-dark-100 dark:hover:bg-dark-800 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>

            {/* Profile widget */}
            <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-dark-800 pl-4">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-dark-100">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              {user?.role === 'student' && (
                <div className="hidden md:flex flex-col items-center bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded text-xs text-primary-600 dark:text-primary-400 font-semibold">
                  <span>Level {user.level}</span>
                  <span>{user.xp} XP</span>
                </div>
              )}
              {user?.role === 'teacher' && (
                <button
                  onClick={handleLogout}
                  className="hidden md:flex p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-dark-100 hover:bg-slate-100 dark:hover:bg-dark-800"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
        {/* Teacher Sidebar (Desktop) */}
        {user?.role === 'teacher' && (
          <aside className="hidden md:block w-64 pr-6 py-6 border-r border-slate-200 dark:border-dark-800">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-8"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>
        )}

        {/* Mobile Menu Drawer (Teacher only) */}
        {user?.role === 'teacher' && mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 bg-white dark:bg-dark-900 h-full flex flex-col p-6 shadow-2xl border-r border-slate-200 dark:border-dark-800">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800"
              >
                <X size={20} />
              </button>
              <div className="mb-8">
                <Link to="/" className="flex items-center space-x-2">
                  <span className="text-2xl">⚔️</span>
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
                    QuizArena
                  </span>
                </Link>
              </div>
              <nav className="flex-1 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-dark-100 dark:hover:bg-dark-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-auto"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 w-full min-w-0 py-6 px-4 sm:px-6 md:px-0 md:pl-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Student Bottom Tabbar Navigation (Mobile / Student Only) */}
      {user?.role === 'student' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-800 shadow-lg px-2 py-2 flex items-center justify-around transition-colors">
          {studentNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-primary-500 dark:text-primary-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-dark-300 dark:hover:text-dark-100'
              }`}
            >
              <item.icon className="w-5.5 h-5.5 mb-1" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-16 py-1 rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-5.5 h-5.5 mb-1" />
            <span className="text-[10px] tracking-tight">Logout</span>
          </button>
        </nav>
      )}
    </div>
  );
};
