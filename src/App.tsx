import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PendingApproval from './pages/PendingApproval';
import Unauthorized from './pages/Unauthorized';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './context/AdminToastContext';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import ContestArena from './pages/student/ContestArena';
import StudentLeaderboard from './pages/student/Leaderboard';

import { FacultyLayout } from './layouts/FacultyLayout';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import MyStudents from './pages/faculty/MyStudents';
import StudentDetails from './pages/faculty/StudentDetails';
import StudentPerformance from './pages/faculty/StudentPerformance';
import StudentActivity from './pages/faculty/StudentActivity';
import FacultyLiveSessions from './pages/faculty/LiveSessions';
import FacultySessionDetails from './pages/faculty/SessionDetails';
import FacultyActivityMonitor from './pages/faculty/ActivityMonitor';
import FacultyAnomalies from './pages/faculty/Anomalies';
import FacultyAnomalyDetails from './pages/faculty/AnomalyDetails';
import FacultyContestStatus from './pages/faculty/ContestStatus';
import FacultyLeaderboard from './pages/faculty/Leaderboard';
import FacultySubmissions from './pages/faculty/Submissions';
import FacultyPerformanceAnalytics from './pages/faculty/PerformanceAnalytics';
import FacultyQuestionAnalytics from './pages/faculty/QuestionAnalytics';
import FacultyDifficultyAnalytics from './pages/faculty/DifficultyAnalytics';
import FacultyReports from './pages/faculty/Reports';
import FacultyNotifications from './pages/faculty/Notifications';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyHelp from './pages/faculty/HelpDocumentation';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ApprovalManagement from './pages/admin/ApprovalManagement';
import FacultyManagement from './pages/admin/FacultyManagement';
import ContestManagement from './pages/admin/ContestManagement';
import CreateContest from './pages/admin/CreateContest';
import EditContest from './pages/admin/EditContest';
import ContestQuestionsManager from './pages/admin/ContestQuestionsManager';
import QuestionBank from './pages/admin/QuestionBank';
import DifficultyManagement from './pages/admin/DifficultyManagement';
import TestCaseManagement from './pages/admin/TestCaseManagement';
import LiveSessions from './pages/admin/LiveSessions';
import SessionDetails from './pages/admin/SessionDetails';
import Submissions from './pages/admin/Submissions';
import Leaderboard from './pages/admin/Leaderboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import StudentAnalytics from './pages/admin/StudentAnalytics';
import AnomalyDetection from './pages/admin/AnomalyDetection';
import ActivityMonitoring from './pages/admin/ActivityMonitoring';
import Reports from './pages/admin/Reports';
import Notifications from './pages/admin/Notifications';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import AdminProfile from './pages/admin/AdminProfile';
import HelpDocumentation from './pages/admin/HelpDocumentation';
import { useAuthStore } from './store/authStore';

// Root Entry Redirection: Unauthenticated users are redirected to /login (Sign In page).
// Authenticated users are safely routed to their role-specific dashboard.
function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (user.role === 'FACULTY') {
    return <Navigate to="/faculty/dashboard" replace />;
  }
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, logout } = useAuthStore();

  // Validate session token with backend on initial application load
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) {
            logout();
          }
        })
        .catch(() => {});
    } else {
      if (isAuthenticated) {
        logout();
      }
    }
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/account/pending" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/student/contest" element={<ContestArena />} />
              <Route path="/arena" element={<Navigate to="/student/contest" replace />} />
              <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
              <Route path="/leaderboard" element={<Navigate to="/student/leaderboard" replace />} />
            </Route>
          </Route>

          {/* Faculty Protected Routes with Dedicated Faculty Supervision Layout */}
          <Route element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']} />}>
            <Route element={<FacultyLayout />}>
              <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/students" element={<MyStudents />} />
              <Route path="/faculty/students/:studentId" element={<StudentDetails />} />
              <Route path="/faculty/student-performance" element={<StudentPerformance />} />
              <Route path="/faculty/students/performance" element={<StudentPerformance />} />
              <Route path="/faculty/students/:studentId/performance" element={<StudentPerformance />} />
              <Route path="/faculty/student-activity" element={<StudentActivity />} />
              <Route path="/faculty/students/activity" element={<StudentActivity />} />
              <Route path="/faculty/students/:studentId/activity" element={<StudentActivity />} />
              <Route path="/faculty/monitoring/sessions" element={<FacultyLiveSessions />} />
              <Route path="/faculty/monitoring/sessions/:sessionId" element={<FacultySessionDetails />} />
              <Route path="/faculty/live-sessions" element={<FacultyLiveSessions />} />
              <Route path="/faculty/live-sessions/:sessionId" element={<FacultySessionDetails />} />
              <Route path="/faculty/monitoring/activity" element={<FacultyActivityMonitor />} />
              <Route path="/faculty/activity" element={<FacultyActivityMonitor />} />
              <Route path="/faculty/monitoring/anomalies" element={<FacultyAnomalies />} />
              <Route path="/faculty/monitoring/anomalies/:id" element={<FacultyAnomalyDetails />} />
              <Route path="/faculty/anomalies" element={<FacultyAnomalies />} />
              <Route path="/faculty/anomalies/:id" element={<FacultyAnomalyDetails />} />
              <Route path="/faculty/contest/status" element={<FacultyContestStatus />} />
              <Route path="/faculty/contest" element={<FacultyContestStatus />} />
              <Route path="/faculty/contest/leaderboard" element={<FacultyLeaderboard />} />
              <Route path="/faculty/leaderboard" element={<FacultyLeaderboard />} />
              <Route path="/faculty/contest/submissions" element={<FacultySubmissions />} />
              <Route path="/faculty/submissions" element={<FacultySubmissions />} />
              <Route path="/faculty/contest/submissions/:submissionId" element={<FacultySubmissions />} />
              <Route path="/faculty/analytics/performance" element={<FacultyPerformanceAnalytics />} />
              <Route path="/faculty/analytics/questions" element={<FacultyQuestionAnalytics />} />
              <Route path="/faculty/analytics/difficulty" element={<FacultyDifficultyAnalytics />} />
              <Route path="/faculty/reports" element={<FacultyReports />} />
              <Route path="/faculty/reports/students" element={<FacultyReports />} />
              <Route path="/faculty/reports/contest" element={<FacultyReports />} />
              <Route path="/faculty/reports/sessions" element={<FacultyReports />} />
              <Route path="/faculty/reports/anomalies" element={<FacultyReports />} />
              <Route path="/faculty/notifications" element={<FacultyNotifications />} />
              <Route path="/faculty/profile" element={<FacultyProfile />} />
              <Route path="/faculty/help" element={<FacultyHelp />} />
            </Route>
          </Route>

          {/* Admin Protected Routes with Dedicated Admin Layout */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route path="/admin/approvals" element={<ApprovalManagement />} />
              <Route path="/admin/rejected-users" element={<UserManagement />} />
              <Route path="/admin/faculty" element={<FacultyManagement />} />
              <Route path="/admin/contests" element={<ContestManagement />} />
              <Route path="/admin/contests/create" element={<CreateContest />} />
              <Route path="/admin/contests/:id/edit" element={<EditContest />} />
              <Route path="/admin/contests/:id/questions" element={<ContestQuestionsManager />} />
              <Route path="/admin/questions" element={<QuestionBank />} />
              <Route path="/admin/questions/difficulty" element={<DifficultyManagement />} />
              <Route path="/admin/test-cases" element={<TestCaseManagement />} />
              <Route path="/admin/live-sessions" element={<LiveSessions />} />
              <Route path="/admin/live-sessions/:id" element={<SessionDetails />} />
              <Route path="/admin/submissions" element={<Submissions />} />
              <Route path="/admin/leaderboard" element={<Leaderboard />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/admin/analytics/questions" element={<QuestionBank />} />
              <Route path="/admin/analytics/students" element={<StudentAnalytics />} />
              <Route path="/admin/anomalies" element={<AnomalyDetection />} />
              <Route path="/admin/activity" element={<ActivityMonitoring />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/help" element={<HelpDocumentation />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
