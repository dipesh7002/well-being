import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    entryDate: {
      type: Date,
      required: true,
      index: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    manualMood: {
      type: String,
      required: true
    },
    detectedMood: {
      type: String,
      default: null
    },
    finalMood: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "final"],
      default: "final"
    },
    sentimentScore: {
      type: Number,
      default: null
    },
    promptUsed: {
      type: String,
      default: ""
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

journalEntrySchema.index({ userId: 1, text: "text" });

export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
