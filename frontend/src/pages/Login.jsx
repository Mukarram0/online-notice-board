/**
 * Login Page (src/pages/Login.jsx)
 * --------------------------------
 * What it does:
 *   Provides the login form for Administrator, Faculty, and Student users.
 * Why it is needed:
 *   Authenticates users, retrieves their JWT and role from the backend,
 *   stores the session in AuthContext, and redirects to the appropriate dashboard.
 * Key Behaviors:
 *   - Displays clear error alerts if credentials are invalid or if account is pending approval.
 *   - Redirects based on role (Admin -> /admin, Faculty -> /faculty, Student -> /student).
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Update global auth context
      login(token, user);

      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'faculty') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error('Login error:', err);
      const serverMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-700 rounded-full mb-3 text-2xl shadow-inner">
            📋
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign In to Your Account</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access the College Online Notice Board
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700 text-sm">
            <p className="font-semibold">Authentication Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@college.edu"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Signing in...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="text-blue-700 hover:text-blue-800 font-semibold transition"
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
