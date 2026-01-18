import express from "express";
import axios from "axios";
import cors from "cors";

const chat = express.Router();

chat.use(cors());
chat.use(express.json());

chat.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.CHATBOT_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      },
    );
    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Chat-Bot Error " });
  }
});

export default chat
