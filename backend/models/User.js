import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    myList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    watchHistory: [
      {
        video: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        progress: {
          type: Number,
          default: 0,
        },
        duration: {
          type: Number,
          default: 0,
        },
        lastWatched: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Automatically assign admin role based on email
const ADMIN_EMAIL = "amarnathkumar2021@gmail.com";

userSchema.pre("save", function (next) {
  if (this.email === ADMIN_EMAIL) {
    this.role = "admin";
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
