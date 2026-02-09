import express from "express";
import mongoose from "mongoose";
import Mood from "../models/moodSchema.js";
import moodStreak from "./mood_streak.js";

const mood = express.Router();

mood.post("/submit", async (req, res) => {
  try {
    const { userId, mood } = req.body;
    if (!userId || !mood) {
      return res.status(400).json({ message: "Missing Data" });
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

mood.get("/average/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);

    const startDate = lastWeek.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const moods = await Mood.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    }).select("mood -_id");

    if (!moods.length) {
      return res.json({ averageScore: null });
    }

    const MOOD_SCORES = {
      Great: 1,
      Good: 2,
      Okay: 3,
      Sad: 4,
      Stressed: 5
    };

    const total = moods.reduce((sum, m) => sum + (MOOD_SCORES[m.mood] || 0), 0);
    const averageScore = total / moods.length;

    res.json({
      averageScore: Number(averageScore.toFixed(1)),
      entries: moods.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

mood.get("/:userId", async (req, res) => {
  try {
    // Fetch last 7 moods, sorted descending by date
    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(7)
      .select("mood date -_id"); // include 'date' field now

    res.json(moods); // each item: { mood: "Good", date: "2026-02-09T00:00:00.000Z" }
  } catch (error) {
    res.status(500).json(error);
  }
});

export default mood;
