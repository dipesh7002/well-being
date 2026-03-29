import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    mood: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    resourceLink: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Suggestion = mongoose.model("Suggestion", suggestionSchema);

