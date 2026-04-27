import express from "express";
import {
  addVideo,
  getAllVideos,
  getSingleVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import { protect, checkAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllVideos);
router.get("/:id", getSingleVideo);

// Admin-only routes
router.post("/", protect, checkAdmin, addVideo);
router.delete("/:id", protect, checkAdmin, deleteVideo);

export default router;
