/**
 * Notice Model (models/Notice.js)
 * --------------------------------
 * What it does:
 *   Defines the Mongoose schema and model for institutional notices.
 * Why it is needed:
 *   Stores notices, their approval state, target audience (all vs specific department),
 *   and relationships to the User model (creator and approver).
 * Notice Statuses:
 *   - 'draft': Created by faculty or admin, still being edited.
 *   - 'pending_approval': Submitted by faculty, awaiting administrator review.
 *   - 'rejected': Reviewed and rejected by admin with a rejectionReason.
 *   - 'published': Approved by admin (or published directly by admin) and visible to students/faculty.
 */

const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    category: {
      type: String,
      required: [true, 'Notice category is required'],
      enum: {
        values: [
          'Academic',
          'Examination',
          'Events',
          'General',
          'Placement',
          'Administration',
        ],
        message: '{VALUE} is not a valid notice category',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Normal', 'High'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Normal',
    },
    targetDepartment: {
      type: String,
      required: [true, 'Target department is required'],
      default: 'ALL', // 'ALL' indicates institution-wide visibility
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'pending_approval', 'rejected', 'published'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
