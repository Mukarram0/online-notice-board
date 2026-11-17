/**
 * Pending Notices Review Page (src/pages/PendingNotices.jsx)
 * ---------------------------------------------------------
 * What it does:
 *   Dedicated review queue for the Administrator to inspect submitted notices.
 * Why it is needed:
 *   Enforces editorial oversight and governance before faculty announcements
 *   are published to students.
 * Key Actions:
 *   - Approve: Instantly publishes the notice, setting approvedBy and publishedAt.
 *   - Reject: Rejects with a mandatory feedback note to guide the author during revision.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const PendingNotices = () => {
  const [pendingNotices, setPendingNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Reject modal state
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notices', { params: { status: 'pending_approval' } });
      if (res.data.success) {
        setPendingNotices(res.data.notices);
      }
    } catch (err) {
      console.error('Failed to load pending notices:', err);
      setError('Failed to fetch pending notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (noticeId) => {
    if (!window.confirm('Approve and publish this notice to all intended students?')) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.patch(`/notices/${noticeId}/approve`);
      if (res.data.success) {
        setFeedbackMsg('Notice approved and published successfully!');
        fetchPending();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve notice.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.patch(`/notices/${selectedNotice._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data.success) {
        setFeedbackMsg('Notice has been rejected with feedback.');
        setSelectedNotice(null);
        setRejectionReason('');
        fetchPending();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject notice.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this notice?')) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.delete(`/notices/${noticeId}`);
      if (res.data.success) {
        setFeedbackMsg('Notice deleted permanently.');
        fetchPending();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notice.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Pending Notice Review Queue
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review notices submitted by faculty. Approved notices are published immediately to students.
        </p>
      </div>

      {feedbackMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r flex justify-between items-center">
          <span>{feedbackMsg}</span>
          <button
            onClick={() => setFeedbackMsg('')}
            className="text-emerald-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading pending approval queue...</p>
        </div>
      ) : pendingNotices.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <span className="text-4xl block mb-2">🎉</span>
          <h3 className="font-bold text-slate-800 text-base">Approval Queue is Empty</h3>
          <p className="text-slate-500 text-sm mt-1">
            There are currently no notices awaiting administrator review.
          </p>
          <Link
            to="/admin"
            className="mt-4 inline-block bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingNotices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-400 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {notice.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      ⏳ Pending Approval
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {notice.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-700">
                    <Link to={`/notices/${notice._id}`}>{notice.title}</Link>
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Author: <strong>{notice.createdBy?.name || 'Faculty'}</strong> ({notice.createdBy?.department})
                    </span>
                    <span>
                      Target Audience:{' '}
                      <strong>
                        {notice.targetDepartment === 'ALL'
                          ? '🌍 All Departments'
                          : `🏛️ ${notice.targetDepartment}`}
                      </strong>
                    </span>
                    <span>
                      Submitted:{' '}
                      {new Date(notice.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Review Action Buttons */}
                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(notice._id)}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNotice(notice);
                      setRejectionReason('');
                    }}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    ✗ Reject
                  </button>
                  <Link
                    to={`/create-notice?edit=${notice._id}`}
                    className="flex-1 sm:flex-none text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-3 py-2 rounded-lg border border-blue-200 transition"
                  >
                    ✏️ Edit
                  </Link>
                  <Link
                    to={`/notices/${notice._id}`}
                    className="flex-1 sm:flex-none text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-300 transition"
                  >
                    Full Details
                  </Link>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    disabled={submittingAction}
                    className="flex-1 sm:flex-none text-center text-red-600 hover:text-red-800 hover:bg-red-50 font-semibold text-xs px-3 py-1.5 rounded-lg border border-red-200 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Reject Notice: "{selectedNotice.title}"
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Enter the reason for rejection. This feedback will be displayed to the faculty member so they can revise and resubmit.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please update the room number and include the contact email..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow"
                >
                  {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingNotices;
