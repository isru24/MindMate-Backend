import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String,
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

export default mongoose.model('Video',VideoSchema);
