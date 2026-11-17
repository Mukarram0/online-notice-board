/**
 * Notice Controller (controllers/noticeController.js)
 * ---------------------------------------------------
 * What it does:
 *   Handles all notice operations: viewing, creating, updating, submitting,
 *   approving, rejecting, and department-based visibility filtering.
 * Why it is needed:
 *   Encapsulates the core business workflow:
 *     Faculty creates notice -> saves as Draft -> submits for Approval
 *     -> Admin approves (Published) or rejects (with reason)
 *     -> Students view published notices according to department visibility.
 */

const Notice = require('../models/Notice');

// @desc    Get notices (filtered by department visibility and status)
// @route   GET /api/notices
// @access  Private (All authenticated users)
const getNotices = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    // 1. Role-based and department-based visibility logic
    if (req.user.role === 'admin') {
      // Admins can see all notices; filter by status query param if provided
      if (status) {
        query.status = status;
      }
    } else {
      // Students and Faculty only see PUBLISHED notices intended for ALL or their specific department
      query.status = 'published';
      const userDept = (req.user.department || '').trim();
      const escapedDept = userDept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { targetDepartment: /^all$/i },
        { targetDepartment: new RegExp(`^${escapedDept}$`, 'i') },
      ];
    }

    // 2. Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 3. Keyword / title search filter
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      if (query.$or) {
        // Combine department visibility and search condition safely using $and
        query.$and = [
          { $or: query.$or },
          { $or: [{ title: searchRegex }, { content: searchRegex }] },
        ];
        delete query.$or;
      } else {
        query.$or = [{ title: searchRegex }, { content: searchRegex }];
      }
    }

    // Execute query, populating creator and approver details
    const notices = await Notice.find(query)
      .populate('createdBy', 'name email role department')
      .populate('approvedBy', 'name email')
      .sort({ publishedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error('Get Notices Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notices: ' + error.message,
    });
  }
};

// @desc    Get single notice by ID (with strict visibility check)
// @route   GET /api/notices/:id
// @access  Private
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('approvedBy', 'name email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Authorization & Visibility check
    const isCreator =
      notice.createdBy &&
      notice.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (isAdmin || isCreator) {
      // Admins and the original author can always view the notice
      return res.status(200).json({ success: true, notice });
    }

    // For students and other faculty: notice must be published
    if (notice.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'This notice has not been published yet.',
      });
    }

    // Check department visibility (case-insensitive and trimmed)
    const noticeDept = (notice.targetDepartment || '').trim().toLowerCase();
    const userDept = (req.user.department || '').trim().toLowerCase();
    const isDeptPermitted = noticeDept === 'all' || noticeDept === userDept;

    if (!isDeptPermitted) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This notice is intended for another department.',
      });
    }

    return res.status(200).json({ success: true, notice });
  } catch (error) {
    console.error('Get Notice By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notice.',
    });
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Faculty or Admin)
const createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, targetDepartment, submitNow } =
      req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and category.',
      });
    }

    let initialStatus = 'draft';
    let approvedBy = null;
    let publishedAt = null;

    if (req.user.role === 'admin') {
      // Administrators can publish directly or save as draft
      if (submitNow) {
        initialStatus = 'published';
        approvedBy = req.user._id;
        publishedAt = new Date();
      } else {
        initialStatus = 'draft';
      }
    } else {
      // Faculty members can save as draft or immediately submit for approval
      if (submitNow) {
        initialStatus = 'pending_approval';
      } else {
        initialStatus = 'draft';
      }
    }

    const newNotice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category,
      priority: priority || 'Normal',
      targetDepartment: targetDepartment || 'ALL',
      createdBy: req.user._id,
      status: initialStatus,
      approvedBy,
      publishedAt,
    });

    const populatedNotice = await Notice.findById(newNotice._id).populate(
      'createdBy',
      'name email role department'
    );

    return res.status(201).json({
      success: true,
      message:
        initialStatus === 'published'
          ? 'Notice created and published directly.'
          : initialStatus === 'pending_approval'
          ? 'Notice submitted successfully for administrator approval.'
          : 'Notice saved as draft.',
      notice: populatedNotice,
    });
  } catch (error) {
    console.error('Create Notice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error creating notice: ' + error.message,
    });
  }
};

// @desc    Get notices created by the logged in user
// @route   GET /api/notices/mine
// @access  Private (Faculty or Admin)
const getMyNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ createdBy: req.user._id })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error('Get My Notices Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your notices.',
    });
  }
};

// @desc    Update a notice (only draft or rejected notices can be edited by faculty)
// @route   PUT /api/notices/:id
// @access  Private (Creator or Admin)
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Ownership check for faculty
    if (
      req.user.role === 'faculty' &&
      notice.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit notices that you created.',
      });
    }

    // Status transition rules:
    // Faculty can only edit drafts or rejected notices
    if (req.user.role === 'faculty') {
      if (notice.status === 'published') {
        return res.status(400).json({
          success: false,
          message: 'Published notices are read-only and cannot be modified.',
        });
      }
      if (notice.status === 'pending_approval') {
        return res.status(400).json({
          success: false,
          message: 'Notice is pending administrator review and cannot be edited right now.',
        });
      }

      // If notice was rejected, editing returns it back to 'draft' state
      if (notice.status === 'rejected') {
        notice.status = 'draft';
        notice.rejectionReason = ''; // Clear previous rejection reason
      }
    }

    const { title, content, category, priority, targetDepartment, submitNow, status } = req.body;

    if (title) notice.title = title.trim();
    if (content) notice.content = content.trim();
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (targetDepartment) notice.targetDepartment = targetDepartment;

    // Admin can publish or adjust status when editing
    if (req.user.role === 'admin') {
      if (submitNow) {
        notice.status = 'published';
        notice.approvedBy = req.user._id;
        notice.publishedAt = notice.publishedAt || new Date();
        notice.rejectionReason = '';
      } else if (status) {
        notice.status = status;
      }
    }

    await notice.save();

    const updated = await Notice.findById(notice._id)
      .populate('createdBy', 'name email role department')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      notice: updated,
    });
  } catch (error) {
    console.error('Update Notice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating notice: ' + error.message,
    });
  }
};

// @desc    Submit a draft notice for administrator approval
// @route   PATCH /api/notices/:id/submit
// @access  Private (Faculty Creator)
const submitNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Ownership check
    if (notice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own notices.',
      });
    }

    // Only draft notices can be submitted
    if (notice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit notice with status '${notice.status}'. Only draft notices can be submitted.`,
      });
    }

    notice.status = 'pending_approval';
    notice.rejectionReason = ''; // Ensure clear
    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice submitted successfully for administrator approval.',
      notice,
    });
  } catch (error) {
    console.error('Submit Notice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting notice: ' + error.message,
    });
  }
};

// @desc    Approve a pending notice
// @route   PATCH /api/notices/:id/approve
// @access  Private (Admin only)
const approveNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Only pending notices can be approved
    if (notice.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve notice with status '${notice.status}'. Only pending notices can be approved.`,
      });
    }

    notice.status = 'published';
    notice.approvedBy = req.user._id;
    notice.publishedAt = new Date();
    notice.rejectionReason = ''; // Clear any residual rejection message
    await notice.save();

    const populatedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'name email role department')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Notice approved and published successfully.',
      notice: populatedNotice,
    });
  } catch (error) {
    console.error('Approve Notice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error approving notice: ' + error.message,
    });
  }
};

// @desc    Reject a pending notice with reason
// @route   PATCH /api/notices/:id/reject
// @access  Private (Admin only)
const rejectNotice = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required to reject a notice.',
      });
    }

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Only pending notices can be rejected
    if (notice.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject notice with status '${notice.status}'. Only pending notices can be rejected.`,
      });
    }

    notice.status = 'rejected';
    notice.rejectionReason = rejectionReason.trim();
    notice.approvedBy = null;
    notice.publishedAt = null;
    await notice.save();

    const populatedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'name email role department')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Notice has been rejected with feedback.',
      notice: populatedNotice,
    });
  } catch (error) {
    console.error('Reject Notice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error rejecting notice: ' + error.message,
    });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin, or Faculty creator for draft/rejected notices)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Role and ownership verification:
    // Administrators can delete ANY notice.
    // Faculty can ONLY delete their own notices if they are in 'draft' or 'rejected' status.
    if (req.user.role === 'faculty') {
      const isCreator = notice.createdBy.toString() === req.user._id.toString();
      if (!isCreator) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete notices that you created.',
        });
      }

      if (notice.status === 'published' || notice.status === 'pending_approval') {
        return res.status(400).json({
          success: false,
          message: `Cannot delete notice with status '${notice.status}'. Only draft or rejected notices can be deleted by faculty.`,
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete notices.',
      });
    }

    await Notice.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Notice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting notice: ' + error.message,
    });
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  getMyNotices,
  updateNotice,
  submitNotice,
  approveNotice,
  rejectNotice,
  deleteNotice,
};
