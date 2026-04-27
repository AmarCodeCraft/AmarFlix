import mongoose from "mongoose";
import Video from "../models/Video.js";
import { validateVideoPayload, isNonEmptyString } from "../utils/validators.js";

export const addVideo = async (req, res) => {
  try {
    const errors = validateVideoPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed.",
        errors,
      });
    }

    const video = await Video.create({
      title: req.body.title.trim(),
      description: req.body.description?.trim() || "",
      thumbnail: req.body.thumbnail.trim(),
      videoUrl: req.body.videoUrl.trim(),
      duration: req.body.duration || 0,
      cloudinaryPublicId: req.body.cloudinaryPublicId?.trim() || "",
      category: req.body.category.trim(),
    });

    return res.status(201).json({
      message: "Video created successfully.",
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create video.",
      error: error.message,
    });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const filter = {};

    if (isNonEmptyString(req.query.category)) {
      filter.category = req.query.category.trim();
    }

    const videos = await Video.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Videos fetched successfully.",
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch videos.",
      error: error.message,
    });
  }
};

export const getSingleVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid video id.",
      });
    }

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found.",
      });
    }

    return res.status(200).json({
      message: "Video fetched successfully.",
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch video.",
      error: error.message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid video id.",
      });
    }

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found.",
      });
    }

    // Note: To fully clean up, you would also delete the video from Cloudinary
    // using cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: "video" })
    
    return res.status(200).json({
      message: "Video deleted successfully.",
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete video.",
      error: error.message,
    });
  }
};
