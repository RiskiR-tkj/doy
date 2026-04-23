import React, { useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { useAuthStore } from './lib/store';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import ExamSession from './pages/ExamSession';
import ResultsPage from './pages/ResultsPage';
import UserManagement from './pages/UserManagement';
import ManageQuestions from './pages/ManageQuestions';

// Route guards
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, initialized } = useAuthStore();
  
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Exam Session (Special Independent Layout) */}
        <Route 
          path="/app/ujian/:id" 
          element={
            <ProtectedRoute>
              <ExamSession />
            </ProtectedRoute>
          } 
        />

        {/* Protected App Routes */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="ujian" element={<ExamList />} />
          <Route path="ujian/:examId/soal" element={<ManageQuestions />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="hasil" element={<ResultsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
