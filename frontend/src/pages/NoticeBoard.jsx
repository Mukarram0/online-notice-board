/**
 * Notice Board Page (src/pages/NoticeBoard.jsx)
 * --------------------------------------------
 * What it does:
 *   General campus notice board accessible to all authenticated users.
 * Why it is needed:
 *   Centralized repository to browse, search, and inspect institutional notices.
 * Department Visibility:
 *   - Admins see all notices with status controls.
 *   - Faculty and Students see published notices for 'ALL' or their specific department.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Academic',
  'Examination',
  'Events',
  'General',
  'Placement',
  'Administration',
];

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState(''); // Only active for admin

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search.trim() !== '') params.search = search.trim();
      if (user?.role === 'admin' && statusFilter !== '') params.status = statusFilter;

      const response = await API.get('/notices', { params });
      if (response.data.success) {
        setNotices(response.data.notices);
      }
    } catch (err) {
      console.error('Failed to load notice board:', err);
      setError('Unable to load notices from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [category, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Normal':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Info Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Campus Notice Board
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Viewing notices relevant to{' '}
            <span className="font-semibold text-slate-800">
              {user?.role === 'admin' ? 'All Institutional Departments' : user?.department}
            </span>
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <Link
            to="/create-notice"
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow"
          >
            + Create Notice
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Filter and Search Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, subject, or title..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-lg text-sm transition shadow"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTimeout(fetchNotices, 10);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                category === cat
                  ? 'bg-blue-700 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Admin Status Filter */}
          {user?.role === 'admin' && (
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Admin Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Notice Feed */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading notice board...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <span className="text-4xl block mb-2">📋</span>
            <h3 className="font-bold text-slate-800 text-base">No notices found</h3>
            <p className="text-slate-500 text-sm mt-1">
              No notices match your current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {notice.category}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {user?.role === 'admin' && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                            notice.status
                          )}`}
                        >
                          {notice.status}
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                          notice.priority
                        )}`}
                      >
                        {notice.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 hover:text-blue-700 transition mb-2">
                    <Link to={`/notices/${notice._id}`}>{notice.title}</Link>
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-700">
                      {notice.targetDepartment === 'ALL'
                        ? '🌍 All Departments'
                        : `🏛️ ${notice.targetDepartment}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {notice.publishedAt
                        ? `Published: ${new Date(notice.publishedAt).toLocaleDateString()}`
                        : `Created: ${new Date(notice.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Link
                    to={`/notices/${notice._id}`}
                    className="font-semibold text-blue-700 hover:text-blue-900 bg-white px-3 py-1 rounded border border-slate-200 shadow-xs hover:border-blue-400 transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
