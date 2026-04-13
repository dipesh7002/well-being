import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env.js";
import { JournalEntry } from "../../src/models/JournalEntry.js";
import { User } from "../../src/models/User.js";
import { countWords } from "../../src/utils/text.js";

export async function createUser(overrides = {}) {
  const password = overrides.password || "Password123!";
  const passwordHash = overrides.passwordHash || (await User.hashPassword(password));

  return User.create({
    fullName: overrides.fullName || "Test User",
    email: overrides.email || `${randomUUID()}@example.com`,
    passwordHash,
    role: overrides.role,
    themePreference: overrides.themePreference,
    reminderEnabled: overrides.reminderEnabled,
    reminderTime: overrides.reminderTime,
    streakCount: overrides.streakCount,
    lastJournalDate: overrides.lastJournalDate,
    badges: overrides.badges,
    consentSettings: overrides.consentSettings,
    isActive: overrides.isActive
  });
}

export async function createJournalEntry(overrides = {}) {
  const user = overrides.user || (await createUser());
  const text = overrides.text || "I am checking in with myself today.";

  return JournalEntry.create({
    userId: overrides.userId || user._id,
    entryDate: overrides.entryDate || new Date(),
    text,
    manualMood: overrides.manualMood || "neutral",
    detectedMood: overrides.detectedMood || null,
    emotionSignals: overrides.emotionSignals || {
      anxious: 0,
      stressed: 0,
      sad: 0,
      calm: 0,
      happy: 0
    },
    finalMood: overrides.finalMood || overrides.manualMood || "neutral",
    status: overrides.status || "final",
    sentimentScore: overrides.sentimentScore || null,
    analysisSource: overrides.analysisSource || "internal",
    wordCount: overrides.wordCount ?? countWords(text),
    promptUsed: overrides.promptUsed || "",
    deletedAt: overrides.deletedAt || null
  });
}

export function signTokenForUser(user) {
  return jwt.sign({ userId: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export function authHeaders(user) {
  return {
    Authorization: `Bearer ${signTokenForUser(user)}`
  };
}
