/**
 * Notice Routes (routes/noticeRoutes.js)
 * --------------------------------------
 * Defines endpoints for notice lifecycle management:
 *   GET   /api/notices             - List notices (filtered by department visibility)
 *   GET   /api/notices/mine        - List notices created by the current user
 *   GET   /api/notices/:id         - View notice details
 *   POST  /api/notices             - Create a new notice (Faculty / Admin)
 *   PUT   /api/notices/:id         - Update draft/rejected notice (Creator / Admin)
 *   PATCH /api/notices/:id/submit  - Submit draft for admin approval (Faculty)
 *   PATCH /api/notices/:id/approve - Approve pending notice (Admin only)
 *   PATCH /api/notices/:id/reject  - Reject pending notice with reason (Admin only)
 */

const express = require('express');
const router = express.Router();

const {
  getNotices,
  getNoticeById,
  createNotice,
  getMyNotices,
  updateNotice,
  submitNotice,
  approveNotice,
  rejectNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Base notice routes
router.get('/', protect, getNotices);
router.post('/', protect, authorize('faculty', 'admin'), createNotice);
router.get('/mine', protect, authorize('faculty', 'admin'), getMyNotices);
router.get('/:id', protect, getNoticeById);
router.put('/:id', protect, authorize('faculty', 'admin'), updateNotice);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteNotice);

// Notice workflow state transition routes
router.patch('/:id/submit', protect, authorize('faculty'), submitNotice);
router.patch('/:id/approve', protect, authorize('admin'), approveNotice);
router.patch('/:id/reject', protect, authorize('admin'), rejectNotice);

module.exports = router;
