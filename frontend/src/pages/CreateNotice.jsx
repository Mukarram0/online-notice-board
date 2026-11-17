/**
 * Create / Edit Notice Page (src/pages/CreateNotice.jsx)
 * -----------------------------------------------------
 * What it does:
 *   Provides the form to author new notices or edit existing drafts/rejected notices.
 * Why it is needed:
 *   Enables Faculty and Administrators to compose notices, select categories,
 *   set priority, specify audience (ALL vs specific department), and either
 *   save as a Draft or immediately submit for approval / publish.
 * Workflow Rules:
 *   - Faculty can save as Draft or submit for Admin approval.
 *   - Admin can publish immediately or save as Draft.
 *   - Editing a rejected notice resets its status to Draft so it can be resubmitted.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Academic',
  'Examination',
  'Events',
  'General',
  'Placement',
  'Administration',
];

const PRIORITIES = ['Low', 'Normal', 'High'];

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Administration',
];

const CreateNotice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Academic',
    priority: 'Normal',
    audienceType: 'ALL', // 'ALL' or 'SPECIFIC'
    targetDepartment: 'ALL',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-load notice data if in edit mode
  useEffect(() => {
    if (editId) {
      const fetchNoticeForEdit = async () => {
        try {
          const response = await API.get(`/notices/${editId}`);
          if (response.data.success) {
            const n = response.data.notice;
            setFormData({
              title: n.title,
              content: n.content,
              category: n.category,
              priority: n.priority,
              audienceType: n.targetDepartment === 'ALL' ? 'ALL' : 'SPECIFIC',
              targetDepartment: n.targetDepartment,
            });
          }
        } catch (err) {
          console.error('Failed to load notice for editing:', err);
          setError(
            err.response?.data?.message || 'Could not load notice for editing.'
          );
        } finally {
          setInitialLoading(false);
        }
      };

      fetchNoticeForEdit();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'audienceType') {
      const defaultDept = (user?.department && DEPARTMENTS.includes(user.department))
        ? user.department
        : 'Computer Science';
      setFormData({
        ...formData,
        audienceType: value,
        targetDepartment: value === 'ALL' ? 'ALL' : defaultDept,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async (submitNow) => {
    setError('');
    setSuccessMsg('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please provide both notice title and content.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        priority: formData.priority,
        targetDepartment:
          formData.audienceType === 'ALL' ? 'ALL' : formData.targetDepartment,
        submitNow,
      };

      if (editId) {
        // Update existing notice
        const res = await API.put(`/notices/${editId}`, payload);
        if (res.data.success) {
          if (submitNow && user?.role === 'faculty') {
            // Also trigger submit transition
            await API.patch(`/notices/${editId}/submit`);
          }
          navigate(user?.role === 'admin' ? '/admin' : '/my-notices');
        }
      } else {
        // Create new notice
        const res = await API.post('/notices', payload);
        if (res.data.success) {
          navigate(user?.role === 'admin' ? '/admin' : '/my-notices');
        }
      }
    } catch (err) {
      console.error('Error saving notice:', err);
      setError(err.response?.data?.message || 'Failed to save notice.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-600 text-sm">Loading notice editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {editId ? 'Edit Notice' : 'Create New Notice'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {user?.role === 'admin'
            ? 'Publish directly or draft an institutional announcement.'
            : 'Draft a notice and submit it for administrator approval.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Notice Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Schedule for Mid-Term MCA Examinations 2026"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Notice Content *
          </label>
          <textarea
            name="content"
            rows={7}
            value={formData.content}
            onChange={handleChange}
            placeholder="Type the full announcement content, instructions, dates, or guidelines here..."
            className="w-full p-4 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm leading-relaxed"
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audience Selection */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Target Audience (Department Visibility)
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="audienceType"
                value="ALL"
                checked={formData.audienceType === 'ALL'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>🌍 <strong>Institution-Wide</strong> (Visible to all students & faculty)</span>
            </label>

            <label className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="audienceType"
                value="SPECIFIC"
                checked={formData.audienceType === 'SPECIFIC'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>🏛️ <strong>Department-Specific</strong> (Restricted to selected department)</span>
            </label>
          </div>

          {/* Department Dropdown when SPECIFIC is chosen */}
          {formData.audienceType === 'SPECIFIC' && (
            <div className="mt-3 pl-7">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Department:
              </label>
              <select
                name="targetDepartment"
                value={formData.targetDepartment}
                onChange={handleChange}
                className="w-full sm:w-80 px-3.5 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {/* Draft / Save Option */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false)}
              className="px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-xs transition"
            >
              {loading ? 'Saving...' : editId ? '💾 Save Changes' : '💾 Save as Draft'}
            </button>

            {/* Submit / Publish Option */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow transition"
            >
              {loading
                ? 'Processing...'
                : editId
                ? user?.role === 'admin'
                  ? '📢 Save & Publish Notice'
                  : '🚀 Save & Submit for Approval'
                : user?.role === 'admin'
                ? '📢 Publish Notice Directly'
                : '🚀 Submit for Approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotice;
