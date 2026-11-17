/**
 * My Notices Page (src/pages/MyNotices.jsx)
 * ----------------------------------------
 * What it does:
 *   Lists all notices authored by the currently logged-in faculty or administrator.
 * Why it is needed:
 *   Gives authors complete lifecycle management over their submissions:
 *   tracking review status, submitting drafts, reviewing rejection reasons,
 *   and making revisions.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const MyNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notices/mine');
      if (res.data.success) {
        setNotices(res.data.notices);
      }
    } catch (err) {
      console.error('Failed to load my notices:', err);
      setError('Unable to load your notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmitDraft = async (noticeId) => {
    if (!window.confirm('Submit this draft notice for administrator approval?')) {
      return;
    }
    try {
      setProcessingId(noticeId);
      const res = await API.patch(`/notices/${noticeId}/submit`);
      if (res.data.success) {
        setActionMsg('Notice submitted successfully for approval.');
        fetchNotices();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit notice.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this notice?')) {
      return;
    }
    try {
      setProcessingId(noticeId);
      const res = await API.delete(`/notices/${noticeId}`);
      if (res.data.success) {
        setActionMsg('Notice deleted successfully.');
        fetchNotices();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notice.');
    } finally {
      setProcessingId(null);
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

  const filteredNotices =
    statusFilter === 'ALL'
      ? notices
      : notices.filter((n) => n.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Authored Notices
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track, edit, submit, and manage your notices throughout their approval lifecycle.
          </p>
        </div>
        <Link
          to="/create-notice"
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow transition"
        >
          + Create New Notice
        </Link>
      </div>

      {actionMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r">
          {actionMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'ALL', label: `All (${notices.length})` },
          {
            key: 'draft',
            label: `Drafts (${notices.filter((n) => n.status === 'draft').length})`,
          },
          {
            key: 'pending_approval',
            label: `Pending (${
              notices.filter((n) => n.status === 'pending_approval').length
            })`,
          },
          {
            key: 'rejected',
            label: `Rejected (${
              notices.filter((n) => n.status === 'rejected').length
            })`,
          },
          {
            key: 'published',
            label: `Published (${
              notices.filter((n) => n.status === 'published').length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.key
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notice Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading your notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-12 p-6">
            <span className="text-4xl block mb-2">📁</span>
            <p className="text-slate-700 font-medium">No notices found in this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotices.map((notice) => (
                  <tr key={notice._id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-semibold text-slate-900 max-w-xs">
                      <Link
                        to={`/notices/${notice._id}`}
                        className="hover:text-blue-700 line-clamp-1"
                      >
                        {notice.title}
                      </Link>
                      {notice.status === 'rejected' && notice.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 line-clamp-1">
                          ⚠️ Reason: {notice.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {notice.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {notice.targetDepartment === 'ALL'
                        ? '🌍 All Departments'
                        : `🏛️ ${notice.targetDepartment}`}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                          notice.status
                        )}`}
                      >
                        {notice.status === 'pending_approval'
                          ? 'Pending Approval'
                          : notice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link
                        to={`/notices/${notice._id}`}
                        className="text-xs font-semibold text-blue-700 hover:underline"
                      >
                        View
                      </Link>

                      {/* Edit option for draft or rejected */}
                      {(notice.status === 'draft' || notice.status === 'rejected') && (
                        <Link
                          to={`/create-notice?edit=${notice._id}`}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                        >
                          Edit
                        </Link>
                      )}

                      {/* Submit button for draft */}
                      {notice.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitDraft(notice._id)}
                          disabled={processingId === notice._id}
                          className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded font-semibold transition"
                        >
                          {processingId === notice._id ? 'Submitting...' : 'Submit'}
                        </button>
                      )}

                      {/* Delete option for draft or rejected */}
                      {(notice.status === 'draft' || notice.status === 'rejected') && (
                        <button
                          onClick={() => handleDeleteNotice(notice._id)}
                          disabled={processingId === notice._id}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotices;
