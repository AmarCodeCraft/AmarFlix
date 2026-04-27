import express from "express";
import {
  addToMyList,
  removeFromMyList,
  getMyList,
  updateWatchProgress,
  getWatchHistory,
  getVideoProgress,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All user routes require authentication
router.use(protect);

// My List
router.get("/my-list", getMyList);
router.post("/my-list", addToMyList);
router.delete("/my-list/:videoId", removeFromMyList);

// Watch History
router.get("/history", getWatchHistory);
router.post("/history", updateWatchProgress);
router.get("/history/:videoId", getVideoProgress);

export default router;
