import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware — verifies JWT from Authorization header or cookie.
 * Attaches user to req.user on success.
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-__v");
    if (!user) {
      return res.status(401).json({
        message: "User not found. Token invalid.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    return res.status(401).json({
      message: "Not authorized. Token verification failed.",
    });
  }
};

/**
 * Admin-only middleware — must be used after protect.
 * Checks if req.user.role === "admin".
 */
export const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

/**
 * Generate a JWT token for a user.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
