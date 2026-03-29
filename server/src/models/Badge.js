import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thresholdDays: { type: Number, required: true },
    icon: { type: String, default: "spark" }
  },
  { timestamps: true }
);

export const Badge = mongoose.model("Badge", badgeSchema);

