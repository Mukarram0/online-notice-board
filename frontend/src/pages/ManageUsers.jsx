/**
 * Manage Users Page (src/pages/ManageUsers.jsx)
 * --------------------------------------------
 * What it does:
 *   Enables the Administrator to view all registered accounts and control account statuses.
 * Why it is needed:
 *   Faculty self-registrations start in 'pending' status and require explicit admin activation
 *   before they can log in. Admins can also deactivate accounts when necessary.
 * Security Rules:
 *   - Admins cannot deactivate their own account.
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const ManageUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to retrieve registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, userName, newStatus) => {
    const actionLabel =
      newStatus === 'active' ? 'activate' : newStatus === 'inactive' ? 'deactivate' : 'update';

    if (!window.confirm(`Are you sure you want to ${actionLabel} account for "${userName}"?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      setError('');
      setSuccessMsg('');
      const res = await API.patch(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'faculty':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'ALL') return true;
    if (filterRole === 'pending') return u.status === 'pending';
    return u.role === filterRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          User Account Management
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review registered accounts, activate pending faculty members, and manage access statuses.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-r flex justify-between items-center">
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg('')}
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

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'ALL', label: `All Users (${users.length})` },
          {
            key: 'pending',
            label: `⏳ Pending Activation (${
              users.filter((u) => u.status === 'pending').length
            })`,
          },
          {
            key: 'faculty',
            label: `Faculty (${users.filter((u) => u.role === 'faculty').length})`,
          },
          {
            key: 'student',
            label: `Students (${users.filter((u) => u.role === 'student').length})`,
          },
          {
            key: 'admin',
            label: `Admins (${users.filter((u) => u.role === 'admin').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterRole(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterRole === tab.key
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading users directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 p-6">
            <span className="text-4xl block mb-2">👥</span>
            <p className="text-slate-700 font-medium">No users found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = u._id === currentAdmin?.id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getRoleBadge(
                            u.role
                          )} uppercase tracking-wider`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {u.department}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                            u.status
                          )} uppercase`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400 font-medium italic">
                            Current Session
                          </span>
                        ) : u.status === 'pending' ? (
                          <button
                            onClick={() => handleStatusChange(u._id, u.name, 'active')}
                            disabled={processingId === u._id}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-md shadow-xs transition"
                          >
                            {processingId === u._id ? 'Activating...' : '✓ Activate Account'}
                          </button>
                        ) : u.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(u._id, u.name, 'inactive')}
                            disabled={processingId === u._id}
                            className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 font-semibold px-3 py-1.5 rounded-md transition"
                          >
                            {processingId === u._id ? 'Updating...' : 'Deactivate'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u._id, u.name, 'active')}
                            disabled={processingId === u._id}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 font-semibold px-3 py-1.5 rounded-md transition"
                          >
                            {processingId === u._id ? 'Updating...' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
