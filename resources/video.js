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
});

const video = express.Router();

video.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "MindMate_videos",
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json(error);
        }

        const savedVideo = await Video.create({
          title: req.body.title,
          description: req.body.description,
          videoUrl: result.secure_url,
          publicId: result.public_id,
        });

        res.status(201).json(savedVideo);
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json(error);
  }
});
video.get("/test", (req, res) => {
  res.send("Video route is working!");
});


export default video;
