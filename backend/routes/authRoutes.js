/**
 * Authentication Routes (routes/authRoutes.js)
 * --------------------------------------------
 * Defines public and protected routes for authentication:
 *   POST /api/auth/register - Register student/faculty
 *   POST /api/auth/login    - User login with rate limiting
 *   GET  /api/auth/me       - Retrieve current authenticated user
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Reasonable login rate limiter to protect against brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication endpoints
router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
