import express from "express";
import passport from "passport";
import { googleCallback, getMe, logout } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`,
    session: false,
  }),
  googleCallback
);

// Get current user
router.get("/me", protect, getMe);

// Logout
router.post("/logout", protect, logout);

export default router;
