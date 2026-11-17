/**
 * Student Dashboard (src/pages/StudentDashboard.jsx)
 * --------------------------------------------------
 * What it does:
 *   Primary dashboard for college students.
 * Why it is needed:
 *   Provides instant access to published notices targeted at the student's department
 *   or institution-wide. Features search by title/content and category filtering.
 * Visibility Rules:
 *   Students only see notices where status === 'published' AND
 *   (targetDepartment === 'ALL' OR targetDepartment === student's department).
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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      // Backend automatically restricts students to published notices for 'ALL' or their department
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }

      const response = await API.get('/notices', { params });
      if (response.data.success) {
        setNotices(response.data.notices);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to load notices from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md mb-8">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-200 text-emerald-900 mb-2 uppercase tracking-wider">
          Student Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {user?.name || 'Student'}
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Showing published announcements for <strong>{user?.department}</strong> and <strong>All Departments</strong>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-8 space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notices by keyword or title..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-lg text-sm transition shadow"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                // re-fetch without search
                setTimeout(fetchNotices, 10);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Cards Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Latest Announcements ({notices.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Fetching published notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <span className="text-4xl block mb-2">📭</span>
            <h3 className="font-bold text-slate-800 text-base">No notices found</h3>
            <p className="text-slate-500 text-sm mt-1">
              There are currently no published notices matching your department or selected filter.
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
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {notice.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        notice.priority
                      )}`}
                    >
                      {notice.priority} Priority
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 hover:text-blue-700 transition mb-2">
                    <Link to={`/notices/${notice._id}`}>{notice.title}</Link>
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-700">
                      {notice.targetDepartment === 'ALL'
                        ? '🌍 All Departments'
                        : `🏛️ ${notice.targetDepartment}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Published: {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/notices/${notice._id}`}
                    className="font-semibold text-blue-700 hover:text-blue-900 bg-white px-3 py-1 rounded border border-slate-200 shadow-xs hover:border-blue-400 transition"
                  >
                    Read →
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

export default StudentDashboard;
