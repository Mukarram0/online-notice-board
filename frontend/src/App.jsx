/**
 * Application Root Component (src/App.jsx)
 * -----------------------------------------
 * What it does:
 *   Configures the client-side router, embeds the global AuthProvider,
 *   renders the Navbar, and establishes role-protected routes.
 * Why it is needed:
 *   Ensures users can only navigate to the pages authorized for their role.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NoticeBoard from './pages/NoticeBoard';
import NoticeDetails from './pages/NoticeDetails';
import CreateNotice from './pages/CreateNotice';
import MyNotices from './pages/MyNotices';
import PendingNotices from './pages/PendingNotices';
import ManageUsers from './pages/ManageUsers';

// Helper component for smart root redirect
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Shared Authenticated Routes */}
              <Route
                path="/notices"
                element={
                  <ProtectedRoute>
                    <NoticeBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notices/:id"
                element={
                  <ProtectedRoute>
                    <NoticeDetails />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Only Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pending"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PendingNotices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Only Routes */}
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Author Routes (Faculty & Admin) */}
              <Route
                path="/create-notice"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <CreateNotice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-notices"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <MyNotices />
                  </ProtectedRoute>
                }
              />

              {/* Student Only Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </main>

          {/* Simple Academic Footer */}
          <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400">
            Online Notice Board Management System • Academic MERN Project
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
