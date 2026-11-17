/**
 * Protected Route Component (src/components/ProtectedRoute.jsx)
 * -------------------------------------------------------------
 * What it does:
 *   Guards private frontend routes against unauthorized access.
 * Why it is needed:
 *   Ensures that only logged-in users with the permitted role can visit a page.
 * How it works:
 *   1. Displays a clean loading indicator while authentication status is being checked.
 *   2. If not logged in, redirects to /login.
 *   3. If logged in but user role does not match allowedRoles, redirects to the user's
 *      authorized dashboard.
 *   4. If authorized, renders the protected page children.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default ProtectedRoute;
