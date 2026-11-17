/**
 * Registration Page (src/pages/Register.jsx)
 * -------------------------------------------
 * What it does:
 *   Provides the registration form for new Students and Faculty members.
 * Why it is needed:
 *   Enables self-onboarding for institutional users.
 * Key Business Rules:
 *   - Administrator role is NOT available for registration (created via seed script only).
 *   - Faculty accounts are created with 'pending' status and require administrator activation.
 *   - Student accounts are created with 'active' status and can log in immediately.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    role: 'student',
  });

  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');

    if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/auth/register', formData);

      // Check if registration resulted in a pending account (Faculty)
      if (response.data.user && response.data.user.status === 'pending') {
        setPendingMessage(
          'Your faculty registration has been submitted successfully! However, your account status is PENDING administrator approval. Once an administrator activates your account, you will be able to sign in.'
        );
      } else if (response.data.token) {
        // Active account (Student)
        login(response.data.token, response.data.user);
        navigate('/student');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const serverMessage =
        err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-700 rounded-full mb-3 text-2xl shadow-inner">
            🎓
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create New Account</h2>
          <p className="text-sm text-slate-500 mt-1">
            Join the Online Notice Board System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700 text-sm">
            <p className="font-semibold">Registration Notice</p>
            <p>{error}</p>
          </div>
        )}

        {/* Pending Faculty Notice Banner */}
        {pendingMessage ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r text-amber-900 text-sm">
              <p className="font-bold text-base mb-1">⏳ Account Pending Approval</p>
              <p className="leading-relaxed">{pendingMessage}</p>
            </div>
            <Link
              to="/login"
              className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Ramesh Kumar / Anjali Sharma"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. user@college.edu"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer text-sm font-medium transition ${
                    formData.role === 'student'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>👨‍🎓 Student</span>
                </label>

                <label
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer text-sm font-medium transition ${
                    formData.role === 'faculty'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="faculty"
                    checked={formData.role === 'faculty'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>👩‍🏫 Faculty / Staff</span>
                </label>
              </div>
              {formData.role === 'faculty' && (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded">
                  ⚠️ Note: Faculty registrations require manual administrator activation before login.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-700 hover:text-blue-800 font-semibold transition"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
