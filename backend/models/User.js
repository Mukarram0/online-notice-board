/**
 * User Model (models/User.js)
 * ----------------------------
 * What it does:
 *   Defines the Mongoose schema and model for application users.
 * Why it is needed:
 *   Validates and structures user data before persisting into the 'users' collection in MongoDB.
 * Key fields:
 *   - name: Full name of the user.
 *   - email: Unique email address used for login.
 *   - password: Encrypted password string (hashed via bcryptjs).
 *   - role: 'admin' | 'faculty' | 'student'.
 *   - department: Academic department (e.g. 'Computer Science', 'Information Technology', etc.).
 *   - status: 'active' | 'pending' | 'inactive'.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'faculty', 'student'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'User role is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'pending', 'inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
