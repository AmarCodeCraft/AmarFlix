import mongoose from "mongoose";
import User from "../models/User.js";

// ─── My List ────────────────────────────────────────────────────────────

/**
 * Add a video to the user's My List.
 */
export const addToMyList = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Valid video ID is required." });
    }

    const user = req.user;
    const objectId = new mongoose.Types.ObjectId(videoId);

    // Check if already in list
    if (user.myList.some((id) => id.equals(objectId))) {
      return res.status(200).json({
        message: "Video already in My List.",
        data: user.myList,
      });
    }

    user.myList.push(objectId);
    await user.save();

    return res.status(200).json({
      message: "Added to My List.",
      data: user.myList,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add to My List.",
      error: error.message,
    });
  }
};

/**
 * Remove a video from the user's My List.
 */
export const removeFromMyList = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Valid video ID is required." });
    }

    const user = req.user;
    const objectId = new mongoose.Types.ObjectId(videoId);

    user.myList = user.myList.filter((id) => !id.equals(objectId));
    await user.save();

    return res.status(200).json({
      message: "Removed from My List.",
      data: user.myList,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove from My List.",
      error: error.message,
    });
  }
};

/**
 * Get the user's My List with populated video data.
 */
export const getMyList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("myList");

    return res.status(200).json({
      message: "My List retrieved successfully.",
      data: user.myList,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get My List.",
      error: error.message,
    });
  }
};

// ─── Watch History ──────────────────────────────────────────────────────

/**
 * Update watch progress for a video.
 */
export const updateWatchProgress = async (req, res) => {
  try {
    const { videoId, progress, duration } = req.body;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Valid video ID is required." });
    }

    const user = req.user;
    const objectId = new mongoose.Types.ObjectId(videoId);

    // Find existing history entry
    const existingIndex = user.watchHistory.findIndex(
      (entry) => entry.video && entry.video.equals(objectId)
    );

    if (existingIndex !== -1) {
      user.watchHistory[existingIndex].progress = progress || 0;
      user.watchHistory[existingIndex].duration = duration || 0;
      user.watchHistory[existingIndex].lastWatched = new Date();
    } else {
      user.watchHistory.push({
        video: objectId,
        progress: progress || 0,
        duration: duration || 0,
        lastWatched: new Date(),
      });
    }

    // Keep only last 50 entries
    if (user.watchHistory.length > 50) {
      user.watchHistory = user.watchHistory
        .sort((a, b) => b.lastWatched - a.lastWatched)
        .slice(0, 50);
    }

    await user.save();

    return res.status(200).json({
      message: "Watch progress updated.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update watch progress.",
      error: error.message,
    });
  }
};

/**
 * Get the user's watch history with populated video data.
 */
export const getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "watchHistory.video"
    );

    // Sort by most recently watched
    const history = (user.watchHistory || [])
      .filter((entry) => entry.video) // Filter out deleted videos
      .sort((a, b) => b.lastWatched - a.lastWatched);

    return res.status(200).json({
      message: "Watch history retrieved.",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get watch history.",
      error: error.message,
    });
  }
};

/**
 * Get watch progress for a specific video.
 */
export const getVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Valid video ID is required." });
    }

    const objectId = new mongoose.Types.ObjectId(videoId);
    const entry = req.user.watchHistory.find(
      (e) => e.video && e.video.equals(objectId)
    );

    return res.status(200).json({
      message: "Progress retrieved.",
      data: entry
        ? { progress: entry.progress, duration: entry.duration }
        : { progress: 0, duration: 0 },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get progress.",
      error: error.message,
    });
  }
};
