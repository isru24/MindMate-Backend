import express from "express";
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

mood.get("/average/:userId",async(req,res)=>{
  try {
    const userId = req.params.userId;
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);

    const startDate = lastWeek.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const moods = await Mood.find({
      userId,
      date: {$gte: startDate , $lie: endDate},
    }).select("mood -_id");
    if (!moods.length) {
      return res.json({averageMood: null});
    }

    const MOOD_SCORES ={
      sad: 1,
      anxious: 2,
      angry: 3,
      happy: 4,
      calm: 5
    }
    const total = moods.reduce((sum,m)=>{
      return sum + (MOOD_SCORES[m.mood] || 0);
    },0);
    const averageScore = total/moods.length;
    res.json({
      averageScore: Number(averageScore.toFixed()),
      entries: moods.length
    })
  } catch (error) {
    res.status(500).json(error)
  }
});


export default mood;
