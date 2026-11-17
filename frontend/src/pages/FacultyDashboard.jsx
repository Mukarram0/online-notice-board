/**
 * Faculty Dashboard (src/pages/FacultyDashboard.jsx)
 * --------------------------------------------------
 * What it does:
 *   Main dashboard for faculty / staff members.
 * Why it is needed:
 *   Gives faculty immediate visibility into their submitted notices, status breakdowns
 *   (Draft, Pending Approval, Rejected, Published), and quick access to create new notices.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyNotices = async () => {
    try {
      setLoading(true);
      const response = await API.get('/notices/mine');
      if (response.data.success) {
        setNotices(response.data.notices);
      }
    } catch (err) {
      console.error('Failed to fetch faculty notices:', err);
      setError('Could not load your notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNotices();
  }, []);

  // Compute status counts
  const draftCount = notices.filter((n) => n.status === 'draft').length;
  const pendingCount = notices.filter((n) => n.status === 'pending_approval').length;
  const rejectedCount = notices.filter((n) => n.status === 'rejected').length;
  const publishedCount = notices.filter((n) => n.status === 'published').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'draft':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatStatus = (status) => {
    if (status === 'pending_approval') return 'Pending Approval';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-200 text-blue-900 mb-2 uppercase tracking-wider">
            Faculty Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {user?.name || 'Faculty Member'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Department of {user?.department} • Notice Management Center
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/create-notice"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition shadow flex items-center space-x-1"
          >
            <span>+</span>
            <span>Create New Notice</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Notice Lifecycle Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Drafts</span>
            <span>✏️</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {loading ? '...' : draftCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Ready to edit / submit</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50">
          <div className="flex justify-between items-center text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <span>Pending</span>
            <span>⏳</span>
          </div>
          <p className="text-3xl font-bold text-amber-900 mt-2">
            {loading ? '...' : pendingCount}
          </p>
          <p className="text-xs text-amber-700 mt-1">Awaiting admin review</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm bg-gradient-to-br from-white to-red-50">
          <div className="flex justify-between items-center text-red-800 text-xs font-semibold uppercase tracking-wider">
            <span>Rejected</span>
            <span>❌</span>
          </div>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {loading ? '...' : rejectedCount}
          </p>
          <p className="text-xs text-red-700 mt-1">Requires revision</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50">
          <div className="flex justify-between items-center text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <span>Published</span>
            <span>✅</span>
          </div>
          <p className="text-3xl font-bold text-emerald-900 mt-2">
            {loading ? '...' : publishedCount}
          </p>
          <p className="text-xs text-emerald-700 mt-1">Visible to students</p>
        </div>
      </div>

      {/* Recent Notice Submissions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your Recent Notices</h2>
          <Link
            to="/my-notices"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Manage All Notices ({notices.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <span className="text-4xl block mb-2">📝</span>
            <p className="text-slate-700 font-medium">You haven't created any notices yet.</p>
            <p className="text-slate-500 text-xs mt-1">
              Click the button below to create your first notice draft.
            </p>
            <Link
              to="/create-notice"
              className="mt-4 inline-block bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Create Notice Draft
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notices.slice(0, 5).map((notice) => (
                  <tr key={notice._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link
                        to={`/notices/${notice._id}`}
                        className="hover:text-blue-700 transition"
                      >
                        {notice.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {notice.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {notice.targetDepartment === 'ALL'
                        ? '🌍 All Departments'
                        : `🏛️ ${notice.targetDepartment}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                          notice.status
                        )}`}
                      >
                        {formatStatus(notice.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/notices/${notice._id}`}
                        className="text-xs font-semibold text-blue-700 hover:underline mr-3"
                      >
                        View
                      </Link>
                      {(notice.status === 'draft' || notice.status === 'rejected') && (
                        <Link
                          to={`/create-notice?edit=${notice._id}`}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Helpful Workflow Reminder Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-900 text-sm">
        <h3 className="font-bold mb-1">💡 Notice Publication Workflow:</h3>
        <p className="text-xs leading-relaxed text-blue-800">
          1. Create and save your notice as <strong>Draft</strong>. • 2. Review content and click <strong>Submit for Approval</strong>. • 3. The <strong>Administrator</strong> reviews and approves your notice. • 4. Once approved, it is automatically <strong>Published</strong> to students belonging to your target department or the entire institution.
        </p>
      </div>
    </div>
  );
};

export default FacultyDashboard;
