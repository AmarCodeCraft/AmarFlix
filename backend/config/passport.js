import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const ADMIN_EMAIL = "amarnathkumar2021@gmail.com";

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update user info on each login
            user.name = profile.displayName;
            user.avatar = profile.photos?.[0]?.value || "";
            // Re-check admin status
            if (user.email === ADMIN_EMAIL) {
              user.role = "admin";
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          const email = profile.emails?.[0]?.value || "";
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value || "",
            role: email === ADMIN_EMAIL ? "admin" : "user",
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
