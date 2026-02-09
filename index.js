import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/auth.js";
import chatBot from "./routes/chatbot.js";
import video from "./resources/video.js";
import audio from "./resources/audio.js";
import mood from "./mood_tracker/moodTracker.js";

dotenv.config();


mongoose.connect("mongodb://localhost:27017/mindmate")
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Error Connecting Database", err));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api",userRoutes);
app.use(chatBot);
app.use("/mood",mood)
app.use("/video",video);
app.use("/audio",audio);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello" });
});

