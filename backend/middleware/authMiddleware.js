/**
 * Authentication & Authorization Middleware (middleware/authMiddleware.js)
 * -------------------------------------------------------------------------
 * What it does:
 *   1. protect: Verifies the JWT Bearer token from the incoming request headers,
 *      ensures the user exists and has an 'active' account status, and attaches
 *      the authenticated user object to req.user.
 *   2. authorize: Enforces Role-Based Access Control (RBAC) by checking if
 *      req.user.role is among the permitted roles for the route.
 * Why it is needed:
 *   Secures private API endpoints so that unauthenticated or unauthorized users
 *   cannot read, create, edit, or approve notices or manage users.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: Verifies JWT token and checks user status
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the token signature using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_mca_project_2026');

      // Fetch the user from MongoDB (exclude password field for security)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      // Check account activation status
      if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending administrator activation.',
        });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact administrator.',
        });
      }

      // Attach user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token is invalid or expired.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No Bearer token provided in header.',
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'guest'}' does not have permission to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
