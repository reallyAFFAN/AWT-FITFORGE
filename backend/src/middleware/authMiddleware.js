
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Authentication token is required.',
      });
    }

    const [scheme, token, ...extra] =
      authHeader.trim().split(/\s+/);

    if (
      scheme !== 'Bearer' ||
      !token ||
      extra.length > 0
    ) {
      return res.status(401).json({
        message: 'Invalid authentication format.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured.');

      return res.status(500).json({
        message: 'Authentication is not configured.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      typeof decoded.userId !== 'string' ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return res.status(401).json({
        message: 'Invalid authentication token.',
      });
    }

    // Resolve the identity from MongoDB, not from
    // frontend-supplied IDs or email addresses.
    const user = await User.findById(decoded.userId)
      .select('_id role');

    if (!user) {
      return res.status(401).json({
        message: 'User account not found. Please log in again.',
      });
    }

    req.userId = user._id.toString();
    req.authenticatedUser = {
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    if (
      error.name !== 'JsonWebTokenError' &&
      error.name !== 'TokenExpiredError'
    ) {
      console.error('Authentication error:', error.message);

      return res.status(500).json({
        message: 'Unable to authenticate this request.',
      });
    }

    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    // authenticateUser must run before requireAdmin.
    if (!req.userId) {
      return res.status(401).json({
        message: 'Authentication is required.',
      });
    }

    const user = await User.findById(req.userId)
      .select('role');

    if (!user) {
      return res.status(401).json({
        message: 'User account not found.',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required.',
      });
    }

    return next();
  } catch (error) {
    console.error(
      'Admin authorization error:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to verify admin permissions.',
    });
  }
}
