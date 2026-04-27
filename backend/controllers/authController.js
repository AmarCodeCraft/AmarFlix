import { generateToken } from "../middleware/auth.js";

/**
 * Handle Google OAuth callback.
 * Called after Passport successfully authenticates the user.
 * Issues a JWT and redirects to the frontend.
 */
export const googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`
      );
    }

    const token = generateToken(req.user._id);

    // Set HTTP-only cookie for security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with token (for SPA to store)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Auth callback error:", error);
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=server_error`
    );
  }
};

/**
 * Get current authenticated user.
 */
export const getMe = (req, res) => {
  return res.status(200).json({
    message: "User retrieved successfully.",
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      myList: req.user.myList,
    },
  });
};

/**
 * Logout — clear the token cookie.
 */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    message: "Logged out successfully.",
  });
};
