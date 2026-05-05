import mongoose from "mongoose";

const breathingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    technique: {
      type: String,
      enum: ["478", "box", "calm"],
      required: true
    },
    rounds: {
      type: Number,
      required: true
    },
    durationSeconds: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

export const BreathingSession = mongoose.model("BreathingSession", breathingSessionSchema);
