/**
 * Authentication Controller (controllers/authController.js)
 * ---------------------------------------------------------
 * What it does:
 *   Handles user registration, login, and profile retrieval.
 * Why it is needed:
 *   Contains the core business logic for user authentication, password hashing
 *   via bcryptjs, account status rules, and JWT generation.
 * Security Rules:
 *   - Admin accounts CANNOT be registered via this endpoint.
 *   - Faculty accounts are created with status: 'pending'.
 *   - Student accounts are created with status: 'active'.
 *   - Inactive or pending users are rejected at login.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department,
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_mca_project_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Student or Faculty)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Validate presence of required fields
    if (!name || !email || !password || !department || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, department, role.',
      });
    }

    // Security check: Only 'student' and 'faculty' can register publicly
    const normalizedRole = role.toLowerCase().trim();
    if (!['student', 'faculty'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected. Public registration only allows 'student' or 'faculty'.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email is already registered
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set initial status: faculty needs approval (pending), students active immediately
    const initialStatus = normalizedRole === 'faculty' ? 'pending' : 'active';

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: normalizedRole,
      department: department.trim(),
      status: initialStatus,
    });

    // If account is pending (faculty), do not issue token until admin activates
    if (newUser.status === 'pending') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Your faculty account is pending administrator activation.',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          status: newUser.status,
        },
      });
    }

    // If active (student), generate token for immediate login
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Online Notice Board.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message,
    });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator activation. Please contact the administrator.',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    // User is verified and active -> generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message,
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (Authenticated)
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile.',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
