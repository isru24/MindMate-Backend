import express from "express";
import Mood from "../models/moodSchema.js";
import moodStreak from "./mood_streak.js";

const mood = express.Router();

mood.post("/submit", async (req, res) => {
  try {
    const { userId, mood } = req.body;
    if (!userId || !mood) {
      return res.status(400).json({ message: "Missin Data" });
    }
    const today = new Date().toISOString().split("T")[0];
    const saveMood = await Mood.create({
      userId,
      mood,
      date: today,
    });
    res.status(201).json(saveMood);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Already submitted today's mood",
      });
    }
    res.status(500).json(error);
  }
});

mood.get("/streak/:userId", async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(30);
    const streak = moodStreak(moods);
    res.json({ streak });
  } catch (error) {
    res.status(500).json(error)
  }
});

mood.get("/:userId", async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(1)
      .select("mood -_id");
    res.json(moods);
  } catch (error) {
    res.status(500).json(error);
  }
});


export default mood;
