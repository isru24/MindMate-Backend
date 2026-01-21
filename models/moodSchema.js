import mongoose from "mongoose";

const MoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["happy", "sad", "anxious", "angry", "calm"],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

MoodSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Mood",MoodSchema)