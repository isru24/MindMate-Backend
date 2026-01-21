import mongoose from "mongoose";

const AudioSchema = new mongoose.Schema({
  title: String,
  description: String,
  audioUrl: String,
  publicId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  published: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Audio", AudioSchema);
