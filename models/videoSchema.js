import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["video", "audio"],
      required: true,
    },

    category: String,

    mediaUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);