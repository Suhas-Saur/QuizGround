import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMobileMode } from '../context/MobileModeContext';
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
  Bell,
  Smartphone,
  Monitor,
  Gamepad2,
  Sparkles,
  Wifi,
  BatteryCharging
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: any;
  isPrimary?: boolean;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, isSimulatedMobile, toggleMobileMode } = useMobileMode();
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

  const teacherMobileNavItems: SidebarItem[] = [
    { name: 'Overview', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Quizzes', path: '/teacher/quizzes', icon: BookOpen },
    { name: 'New Quiz', path: '/teacher/create-quiz', icon: PlusCircle, isPrimary: true },
    { name: 'Classes', path: '/teacher/classes', icon: Users },
    { name: 'Reports', path: '/teacher/reports', icon: FileSpreadsheet }
  ];

  const studentNavItems: SidebarItem[] = [
    { name: 'Home', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Practice', path: '/student/practice', icon: BookOpen },
    { name: 'Join PIN', path: '/join', icon: Gamepad2, isPrimary: true },
    { name: 'Ranks', path: '/student/leaderboard', icon: Trophy },
    { name: 'Progress', path: '/student/progress', icon: User }
  ];

  const sidebarItems = user?.role === 'teacher' ? teacherItems : [];
  const currentMobileNavItems = user?.role === 'teacher' ? teacherMobileNavItems : studentNavItems;

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

  // Content body
  const layoutContent = (
    <div className={`min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col transition-colors duration-200 ${isSimulatedMobile ? 'simulated-phone-view' : ''}`}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur border-b border-slate-200 dark:border-dark-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user?.role === 'teacher' && !isSimulatedMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-dark-100 dark:hover:bg-dark-800 active:scale-95 transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2 active:scale-95 transition">
              <span className="text-2xl">⚔️</span>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
                QuizArena
              </span>
            </Link>

            {/* Role indicator pill on mobile */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
              {user?.role === 'teacher' ? '🧑‍🏫 Teacher' : '🎓 Student'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Mode Toggle Switcher */}
            <button
              onClick={toggleMobileMode}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 ${
                isSimulatedMobile
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-dark-100'
              }`}
              title={isSimulatedMobile ? 'Switch back to Desktop Mode' : 'Toggle Mobile Option Mode (Smartphone Preview)'}
            >
              {isSimulatedMobile ? <Monitor size={14} /> : <Smartphone size={14} />}
              <span className="hidden sm:inline">
                {isSimulatedMobile ? 'Desktop View' : 'Mobile View'}
              </span>
            </button>

            {/* Switch Role developer shortcut */}
            <button
              onClick={handleSwapRole}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center space-x-1 transition active:scale-95"
              title={`Switch to ${user?.role === 'teacher' ? 'Student' : 'Teacher'} account`}
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Switch Role</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-dark-100 dark:hover:bg-dark-800 transition active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Profile avatar */}
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-dark-800 pl-2 sm:pl-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 flex items-center justify-center font-extrabold text-xs shadow-inner">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-700 dark:text-dark-100 truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>

              {!isSimulatedMobile && user?.role === 'teacher' && (
                <button
                  onClick={handleLogout}
                  className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-dark-100 hover:bg-slate-100 dark:hover:bg-dark-800"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
        {/* Teacher Sidebar (Desktop only, hidden in simulated mobile or real mobile) */}
        {!isSimulatedMobile && user?.role === 'teacher' && (
          <aside className="hidden md:block w-64 pr-6 py-6 border-r border-slate-200 dark:border-dark-800 shrink-0">
            <nav className="space-y-1.5">
              {sidebarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 translate-x-1'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition mt-8"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>
        )}

        {/* Mobile Menu Drawer (Teacher on mobile view) */}
        {user?.role === 'teacher' && mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 bg-white dark:bg-dark-900 h-full flex flex-col p-6 shadow-2xl border-r border-slate-200 dark:border-dark-800 animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800"
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
                <p className="text-xs text-slate-400 mt-1 font-medium">Instructor Portal</p>
              </div>
              <nav className="flex-1 space-y-1.5">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                      isActive(item.path)
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
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
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition mt-auto"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Panel */}
        <main className={`flex-1 w-full min-w-0 py-4 sm:py-6 px-3 sm:px-6 md:px-0 md:pl-6 pb-28 md:pb-6`}>
          {children}
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Visible in mobile viewport OR simulated mobile mode) */}
      {(isMobile || isSimulatedMobile) && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-dark-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around transition-colors pb-safe">
          {currentMobileNavItems.map((item) => {
            const active = isActive(item.path);

            if (item.isPrimary) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex flex-col items-center -mt-6 group active:scale-90 transition-transform"
                >
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    user?.role === 'teacher'
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-indigo-500/30 group-hover:scale-105'
                      : 'bg-gradient-to-tr from-primary-600 to-primary-500 text-white shadow-primary-500/30 group-hover:scale-105'
                  }`}>
                    <item.icon className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className={`text-[10px] font-bold mt-1 tracking-tight ${
                    active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 font-extrabold scale-105'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${active ? 'bg-primary-50 dark:bg-primary-950/60' : ''}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
              </Link>
            );
          })}

          {/* Quick Logout Icon on Mobile */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-danger active:scale-95 transition"
            title="Sign out"
          >
            <div className="p-1 rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Exit</span>
          </button>
        </nav>
      )}
    </div>
  );

  // If user activated "Simulated Mobile Mode" on Desktop, display inside an elegant smartphone mockup chassis!
  if (isSimulatedMobile) {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center justify-start select-none">
        {/* Desktop control banner above phone */}
        <div className="mb-4 flex items-center justify-between w-full max-w-[420px] bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl text-xs text-white shadow-xl backdrop-blur">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">📱 Mobile Mode Simulation</span>
          </div>
          <button
            onClick={toggleMobileMode}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-xl font-bold transition flex items-center space-x-1 shadow-sm"
          >
            <Monitor size={13} />
            <span>Exit to Desktop</span>
          </button>
        </div>

        {/* Realistic Smartphone Chassis */}
        <div className="simulated-phone-wrapper bg-white dark:bg-dark-950 shadow-2xl flex flex-col">
          {/* Simulated Mobile Status Bar with Dynamic Island */}
          <div className="bg-white dark:bg-dark-900 px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-800 dark:text-white shrink-0 select-none">
            <span className="font-bold text-[11px]">9:41</span>
            {/* Dynamic Island pill */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              <Wifi size={12} />
              <BatteryCharging size={13} className="text-emerald-500" />
            </div>
          </div>

          {/* Inner scrollable app container */}
          <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {layoutContent}
          </div>
        </div>
      </div>
    );
  }

  // Regular Desktop or Native Mobile Rendering
  return layoutContent;
};
