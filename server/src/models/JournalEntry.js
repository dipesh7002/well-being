import mongoose from "mongoose";

const emotionSignalsSchema = new mongoose.Schema(
  {
    anxious: { type: Number, default: 0 },
    stressed: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    calm: { type: Number, default: 0 },
    happy: { type: Number, default: 0 }
  },
  { _id: false }
);

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
    emotionSignals: {
      type: emotionSignalsSchema,
      default: () => ({})
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
    analysisSource: {
      type: String,
      enum: ["python", "internal", "off"],
      default: "off"
    },
    wordCount: {
      type: Number,
      default: 0
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
