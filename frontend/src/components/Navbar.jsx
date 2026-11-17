/**
 * Navigation Bar Component (src/components/Navbar.jsx)
 * ----------------------------------------------------
 * What it does:
 *   Provides top navigation for the entire application, showing appropriate
 *   navigation links based on user role (Admin, Faculty, Student) and a user summary badge.
 * Why it is needed:
 *   Gives users an intuitive, accessible menu to navigate between dashboards,
 *   notice feeds, creation tools, and account actions (logout).
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Helper for role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'faculty':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand Name */}
          <Link
            to={
              !user
                ? '/login'
                : user.role === 'admin'
                ? '/admin'
                : user.role === 'faculty'
                ? '/faculty'
                : '/student'
            }
            className="flex items-center space-x-3 text-white font-bold text-lg hover:text-blue-300 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <span>Online Notice Board</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Admin Links */}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/admin')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/pending"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/admin/pending')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Pending Notices
                    </Link>
                    <Link
                      to="/notices"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/notices')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      All Notices
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/admin/users')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Manage Users
                    </Link>
                    <Link
                      to="/create-notice"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/create-notice')
                          ? 'bg-blue-700 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      + Create Notice
                    </Link>
                  </>
                )}

                {/* Faculty Links */}
                {user.role === 'faculty' && (
                  <>
                    <Link
                      to="/faculty"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/faculty')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-notices"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/my-notices')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      My Notices
                    </Link>
                    <Link
                      to="/notices"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/notices')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Notice Board
                    </Link>
                    <Link
                      to="/create-notice"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/create-notice')
                          ? 'bg-blue-700 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      + Create Notice
                    </Link>
                  </>
                )}

                {/* Student Links */}
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/student"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/student')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/notices"
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        isActive('/notices')
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      Notice Board
                    </Link>
                  </>
                )}

                {/* User info badge */}
                <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-700">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-100">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.department}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getRoleBadge(
                      user.role
                    )} uppercase tracking-wider`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-red-300 hover:bg-red-950 hover:text-red-100 transition border border-red-800/50"
                  title="Logout from system"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive('/login')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive('/register')
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
