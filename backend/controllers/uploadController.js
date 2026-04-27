import cloudinary from "../config/cloudinary.js";
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const uploadVideoToCloudinary = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided." });
    }

    // Fallback: If Cloudinary keys are missing or still set to default, save locally
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const uploadDir = path.join(__dirname, "../../frontend/public/uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, req.file.buffer);

      return res.status(200).json({
        message: "Video uploaded locally (Cloudinary keys not set).",
        videoUrl: `/uploads/${fileName}`,
        duration: 0,
        publicId: `local_${fileName}`,
      });
    }

    // Cloudinary Upload
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "amarflix_videos",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            message: "Failed to upload video to Cloudinary.",
            error: error.message,
          });
        }

        return res.status(200).json({
          message: "Video uploaded successfully.",
          videoUrl: result.secure_url,
          duration: result.duration,
          publicId: result.public_id,
        });
      }
    );

    // Pipe the buffer from multer to cloudinary stream
    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during upload.",
      error: error.message,
    });
  }
};
