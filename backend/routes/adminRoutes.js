/**
 * Administrator Routes (routes/adminRoutes.js)
 * --------------------------------------------
 * Defines administrative endpoints:
 *   GET   /api/admin/dashboard        - Portal metrics (users, notices, pending queue)
 *   GET   /api/admin/users            - List of all registered users
 *   PATCH /api/admin/users/:id/status - Activate or deactivate user accounts
 */

const express = require('express');
const router = express.Router();

const {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require both authentication and the 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
