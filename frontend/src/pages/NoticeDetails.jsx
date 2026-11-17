/**
 * Notice Details Page (src/pages/NoticeDetails.jsx)
 * ------------------------------------------------
 * What it does:
 *   Renders the complete details of a specific notice.
 * Why it is needed:
 *   Allows users to read the full content, view administrative metadata
 *   (approver, published timestamp, rejection reasons), and perform contextual actions
 *   (approving/rejecting if admin, editing/submitting if creator).
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const NoticeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Rejection modal state for admin
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get(`/notices/${id}`);
      if (response.data.success) {
        setNotice(response.data.notice);
      }
    } catch (err) {
      console.error('Failed to load notice:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load notice. You may not have permission to view it.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  // Admin approves pending notice
  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve and publish this notice?')) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.patch(`/notices/${id}/approve`);
      if (res.data.success) {
        setActionSuccess('Notice approved and published successfully.');
        setNotice(res.data.notice);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve notice.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Admin rejects pending notice
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting this notice.');
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.patch(`/notices/${id}/reject`, { rejectionReason });
      if (res.data.success) {
        setActionSuccess('Notice rejected with feedback.');
        setNotice(res.data.notice);
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject notice.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Faculty submits draft notice for approval
  const handleSubmitForApproval = async () => {
    if (!window.confirm('Submit this draft notice for administrator review?')) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.patch(`/notices/${id}/submit`);
      if (res.data.success) {
        setActionSuccess('Notice submitted for administrator approval.');
        fetchNotice();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit notice.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete notice (Admin can delete any notice; Faculty can delete their own drafts/rejected)
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this notice? This action cannot be undone.')) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await API.delete(`/notices/${id}`);
      if (res.data.success) {
        alert('Notice deleted successfully.');
        navigate(user?.role === 'admin' ? '/admin' : '/my-notices');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notice.');
      setSubmittingAction(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Normal':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading notice details...</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
          <span className="text-4xl block mb-3">⚠️</span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied or Not Found</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            {error || 'The requested notice does not exist or you do not have permission to view it.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCreator = notice.createdBy && notice.createdBy._id === user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
        >
          <span>← Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Edit Notice Button (Admin can edit any notice; Creator can edit draft/rejected) */}
          {(isAdmin || (isCreator && (notice.status === 'draft' || notice.status === 'rejected'))) && (
            <Link
              to={`/create-notice?edit=${notice._id}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 transition flex items-center space-x-1"
            >
              <span>✏️</span>
              <span>Edit Notice</span>
            </Link>
          )}

          {isCreator && notice.status === 'draft' && (
            <button
              onClick={handleSubmitForApproval}
              disabled={submittingAction}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow"
            >
              Submit for Approval
            </button>
          )}

          {/* Delete Notice Button (Admin can delete any notice; Creator can delete draft/rejected) */}
          {(isAdmin || (isCreator && (notice.status === 'draft' || notice.status === 'rejected'))) && (
            <button
              onClick={handleDelete}
              disabled={submittingAction}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow flex items-center space-x-1"
            >
              <span>🗑️</span>
              <span>Delete Notice</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r">
          {actionSuccess}
        </div>
      )}

      {/* Main Notice Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        {/* Notice Meta Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 text-slate-800">
              {notice.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityBadge(
                notice.priority
              )}`}
            >
              {notice.priority} Priority
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                notice.status
              )}`}
            >
              Status: {notice.status === 'pending_approval' ? 'Pending Approval' : notice.status.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {notice.title}
          </h1>

          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Target Audience: </span>
              {notice.targetDepartment === 'ALL'
                ? '🌍 Institution-Wide (All Departments)'
                : `🏛️ ${notice.targetDepartment}`}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Posted By: </span>
              {notice.createdBy?.name || 'Faculty'} ({notice.createdBy?.department || 'Department'})
            </div>
            <div>
              <span className="font-semibold text-slate-700">Date: </span>
              {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Rejection Notice Banner if rejected */}
        {notice.status === 'rejected' && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-sm">
            <p className="font-bold flex items-center space-x-1">
              <span>❌ Notice Rejection Feedback</span>
            </p>
            <p className="mt-1 text-red-700">
              {notice.rejectionReason || 'No specific reason provided.'}
            </p>
            {isCreator && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                💡 Tip: Click "Edit Notice" above to update the notice. Editing will reset its status to Draft so you can resubmit.
              </p>
            )}
          </div>
        )}

        {/* Notice Content Body */}
        <div className="p-6 sm:p-8 text-slate-800 text-base leading-relaxed whitespace-pre-line min-h-[160px]">
          {notice.content}
        </div>

        {/* Approval Footer (if published) */}
        {notice.status === 'published' && notice.approvedBy && (
          <div className="px-6 sm:px-8 py-3 bg-emerald-50/40 border-t border-emerald-100 text-xs text-emerald-800 flex justify-between items-center">
            <span>
              ✅ Approved by Administrator: <strong>{notice.approvedBy.name}</strong>
            </span>
            <span>
              Published on: {new Date(notice.publishedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Admin Review Action Bar */}
        {isAdmin && notice.status === 'pending_approval' && (
          <div className="p-6 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Administrative Decision Required</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                This notice is awaiting your review before publication.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleApprove}
                disabled={submittingAction}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition"
              >
                ✓ Approve & Publish
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={submittingAction}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition"
              >
                ✗ Reject Notice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Notice</h3>
            <p className="text-xs text-slate-600 mb-4">
              Please enter a constructive reason for rejecting this notice. The faculty creator will see this feedback when revising.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please clarify the event timings and update the venue details..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeDetails;
