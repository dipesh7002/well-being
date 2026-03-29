import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../utils/constants.js";

const badgeAwardSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    awardedAt: { type: Date, default: Date.now },
    icon: { type: String, default: "spark" }
  },
  { _id: false }
);

const consentSettingsSchema = new mongoose.Schema(
  {
    allowHelperSharing: { type: Boolean, default: false },
    shareMoodSummaries: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    themePreference: {
      type: String,
      default: "sunrise"
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: "20:00"
    },
    streakCount: {
      type: Number,
      default: 0
    },
    lastJournalDate: {
      type: Date,
      default: null
    },
    badges: {
      type: [badgeAwardSchema],
      default: []
    },
    consentSettings: {
      type: consentSettingsSchema,
      default: () => ({})
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

export const User = mongoose.model("User", userSchema);

