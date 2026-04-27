import express from "express";
import multer from "multer";
import { uploadVideoToCloudinary } from "../controllers/uploadController.js";
import { protect, checkAdmin } from "../middleware/auth.js";

const router = express.Router();

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow video files
    const allowedMimes = ["video/mp4", "video/webm", "video/quicktime"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .mp4, .webm, and .mov video files are allowed."), false);
    }
  }
});

// POST /api/upload — Admin only
router.post("/", protect, checkAdmin, upload.single("video"), uploadVideoToCloudinary);

export default router;
