import dotenv from "dotenv";
import express from "express";
import Audio from "../models/audioSchema.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

dotenv.config();
cloudinary.config({
  cloud_name: "dspncszrc",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
});

const audio = express.Router();

audio.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "MindMate_audio",
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json(error);
        }

        const saveAudio = await Audio.create({
          title: req.body.title,
          description: req.body.description,
          audioUrl: result.secure_url,
          publicId: result.public_id,
        });

        res.status(201).json(saveAudio);
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json(error);
  }
});

audio.get("/", async (req, res) => {
  try {
    const audios = await Audio.find().sort({ createdAt: -1 });
    res.json(audios);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audios" });
  }
});

export default audio;
