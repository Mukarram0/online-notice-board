/**
 * Administrator Controller (controllers/adminController.js)
 * ---------------------------------------------------------
 * What it does:
 *   Provides administrative dashboard statistics, user management (viewing registered users),
 *   and account status management (activating pending faculty or deactivating users).
 * Why it is needed:
 *   Enables administrators to monitor portal statistics and control user access.
 */

const User = require('../models/User');
const Notice = require('../models/Notice');

// @desc    Get dashboard metrics (total users, total notices, pending notices, etc.)
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalNotices,
      pendingNotices,
      publishedNotices,
      pendingFaculty,
    ] = await Promise.all([
      User.countDocuments(),
      Notice.countDocuments(),
      Notice.countDocuments({ status: 'pending_approval' }),
      Notice.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'faculty', status: 'pending' }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalNotices,
        pendingNotices,
        publishedNotices,
        pendingFaculty,
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving administrator dashboard stats.',
    });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users.',
    });
  }
};

// @desc    Update user account status (active, pending, inactive)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'pending', 'inactive'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values are 'active', 'pending', or 'inactive'.",
      });
    }

    // Prevent admin from deactivating or changing their own account status
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot change their own account status.',
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' status updated to '${status}'.`,
      user,
    });
  } catch (error) {
    console.error('Update User Status Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating user status.',
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
};
