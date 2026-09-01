import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Import Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { PracticeBrowsePage } from './pages/PracticeBrowsePage';
import { PracticePlayPage } from './pages/PracticePlayPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { StudentLivePlayPage } from './pages/StudentLivePlayPage';
import { StudentLeaderboardPage } from './pages/StudentLeaderboardPage';
import { StudentProgressPage } from './pages/StudentProgressPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { QuizBuilderPage } from './pages/QuizBuilderPage';
import { TeacherHostPage } from './pages/TeacherHostPage';
import { QuizReportPage } from './pages/QuizReportPage';
import { ClassManagementPage } from './pages/ClassManagementPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'student' | 'teacher' }> = ({
  children,
  allowedRole
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-50 dark:bg-dark-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Restoring authentication state...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Marketing Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Protected Routes (uses bottom navbar layout inside DashboardLayout) */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/practice"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <PracticeBrowsePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/practice/play/:id"
        element={
          <ProtectedRoute allowedRole="student">
            <PracticePlayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/practice/results/:attemptId"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <QuizResultPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leaderboard"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentLeaderboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/progress"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout>
              <StudentProgressPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared PIN Entry join Page */}
      <Route
        path="/join"
        element={
          <ProtectedRoute allowedRole="student">
            <JoinRoomPage />
          </ProtectedRoute>
        }
      />

      {/* Student Real-time Multiplayer screen */}
      <Route
        path="/student/live/:roomCode"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLivePlayPage />
          </ProtectedRoute>
        }
      />

      {/* Teacher Protected Routes (uses sidebar drawer inside DashboardLayout) */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout>
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/quizzes"
        element={<Navigate to="/teacher/dashboard" replace />}
      />
      <Route
        path="/teacher/create-quiz"
        element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout>
              <QuizBuilderPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/edit-quiz/:id"
        element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout>
              <QuizBuilderPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/reports/:quizId"
        element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout>
              <QuizReportPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout>
              <ClassManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Teacher Real-time Projector Host View (Full screen high-contrast styling) */}
      <Route
        path="/teacher/host/:roomCode"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherHostPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};
