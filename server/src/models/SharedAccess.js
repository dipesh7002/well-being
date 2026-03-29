import mongoose from "mongoose";

const helperFeedbackSchema = new mongoose.Schema(
  {
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const sharedAccessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sharedEntryIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JournalEntry"
        }
      ],
      default: []
    },
    sharingScope: {
      type: String,
      enum: ["selected"],
      default: "selected"
    },
    consentGrantedAt: {
      type: Date,
      default: Date.now
    },
    revokedAt: {
      type: Date,
      default: null
    },
    helperFeedback: {
      type: [helperFeedbackSchema],
      default: []
    }
  },
  { timestamps: true }
);

sharedAccessSchema.index({ userId: 1, helperId: 1 }, { unique: true });

export const SharedAccess = mongoose.model("SharedAccess", sharedAccessSchema);
