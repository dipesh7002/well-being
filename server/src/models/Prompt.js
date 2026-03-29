import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    targetMoods: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Prompt = mongoose.model("Prompt", promptSchema);

