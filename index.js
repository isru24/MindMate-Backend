import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/auth.js";
import chatBot from "./routes/chatbot.js";

dotenv.config();

mongoose.connect("mongodb://localhost:27017/MindMate")
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Error Connecting Database", err));

const app = express();
app.use(express.json());

app.use(chatBot);
app.use(userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello" });
});

