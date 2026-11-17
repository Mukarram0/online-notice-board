/**
 * Administrator Dashboard (src/pages/AdminDashboard.jsx)
 * -------------------------------------------------------
 * What it does:
 *   Central control center for the system administrator.
 * Why it is needed:
 *   Provides high-level metrics (total users, total notices, pending notices, pending faculty)
 *   and direct one-click access to review queues and user management.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotices: 0,
    pendingNotices: 0,
    publishedNotices: 0,
    pendingFaculty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await API.get('/admin/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
        setError('Failed to fetch dashboard statistics. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-200 text-purple-900 mb-2 uppercase tracking-wider">
            Administrator Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Department of {user?.department || 'Administration'} • System Overview
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/create-notice"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow"
          >
            + Create & Publish Notice
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.totalUsers}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Faculty & Students</span>
            <Link to="/admin/users" className="text-blue-600 hover:underline font-medium">
              Manage Users →
            </Link>
          </div>
        </div>

        {/* Pending Notices */}
        <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">Pending Review</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-amber-900 mt-2">
            {loading ? '...' : stats.pendingNotices}
          </p>
          <div className="mt-3 pt-3 border-t border-amber-100 flex justify-between items-center text-xs text-amber-700">
            <span>Notices awaiting approval</span>
            <Link to="/admin/pending" className="text-amber-800 hover:underline font-semibold">
              Review Queue →
            </Link>
          </div>
        </div>

        {/* Published Notices */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Published Notices</span>
            <span className="text-2xl">📢</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.publishedNotices}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Active on board</span>
            <Link to="/notices" className="text-blue-600 hover:underline font-medium">
              Browse All →
            </Link>
          </div>
        </div>

        {/* Pending Faculty Accounts */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Faculty</span>
            <span className="text-2xl">👩‍🏫</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.pendingFaculty}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Awaiting account activation</span>
            <Link to="/admin/users" className="text-blue-600 hover:underline font-medium">
              Activate Users →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Administrator Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/pending"
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center text-xl mb-3">
              📝
            </div>
            <h3 className="font-bold text-slate-900 text-base">Approve / Reject Notices</h3>
            <p className="text-sm text-slate-600 mt-1">
              Review notices submitted by faculty members, approve them for publication, or return them with a rejection reason.
            </p>
          </div>
          <span className="mt-4 text-sm font-semibold text-blue-700 flex items-center">
            Open Pending Queue ({stats.pendingNotices}) →
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center text-xl mb-3">
              👥
            </div>
            <h3 className="font-bold text-slate-900 text-base">Manage Users & Activation</h3>
            <p className="text-sm text-slate-600 mt-1">
              View all registered faculty and students, approve pending faculty registrations, and activate or deactivate accounts.
            </p>
          </div>
          <span className="mt-4 text-sm font-semibold text-blue-700 flex items-center">
            Manage Registered Users →
          </span>
        </Link>

        <Link
          to="/notices"
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center text-xl mb-3">
              📋
            </div>
            <h3 className="font-bold text-slate-900 text-base">Public Notice Board</h3>
            <p className="text-sm text-slate-600 mt-1">
              Browse institution-wide notices, view notice details, filter by academic categories, and search announcements.
            </p>
          </div>
          <span className="mt-4 text-sm font-semibold text-blue-700 flex items-center">
            View All Published Notices →
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
