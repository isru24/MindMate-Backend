import dotenv from "dotenv"
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Video from "../models/videoSchema.js";

dotenv.config()
cloudinary.config({
  cloud_name: "dspncszrc",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  }
});

const video = express.Router();

video.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    cloudinary.uploader.upload_stream(
      {
        resource_type: "video", 
        folder: "MindMate_videos",
      },
      async (error, result) => {
        if (error) return res.status(500).json(error);

        const media = await Video.create({
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          type: "video",
          mediaUrl: result.secure_url,
          publicId: result.public_id,
        });

        res.status(201).json(media);
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});
video.get("/", async (req, res) => {
  const { type } = req.query;

  const filter = type ? { type } : {};
  const media = await Video.find(filter).sort({ createdAt: -1 });
  res.json(media);
});

export default video;
