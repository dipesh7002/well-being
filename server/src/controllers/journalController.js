import mongoose from "mongoose";
import { matchedData } from "express-validator";
import { JournalEntry } from "../models/JournalEntry.js";
import { SharedAccess } from "../models/SharedAccess.js";
import { User } from "../models/User.js";
import {
  analyzeJournalText,
  detectDistressLanguage,
  getHistoryBasedSuggestion
} from "../services/journalInsightService.js";
import { recomputeUserProgress } from "../services/streakService.js";
import { normalizeEntryDate } from "../utils/date.js";
import { countWords } from "../utils/text.js";
import { ROLES } from "../utils/constants.js";

function buildEntryQuery(userId, filters) {
  const query = {
    userId,
    deletedAt: null
  };

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.mood) {
    query.finalMood = filters.mood;
  }

  if (filters.from || filters.to) {
    query.entryDate = {};
    if (filters.from) {
      query.entryDate.$gte = normalizeEntryDate(filters.from);
    }
    if (filters.to) {
      query.entryDate.$lte = normalizeEntryDate(filters.to);
    }
  }

  return query;
}

export async function listEntries(req, res, next) {
  try {
    const { search, mood, from, to } = req.query;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;
    const query = buildEntryQuery(req.user._id, { search, mood, from, to });

    const [entries, total] = await Promise.all([
      JournalEntry.find(query)
        .sort({ entryDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JournalEntry.countDocuments(query)
    ]);

    return res.json({
      entries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getEntry(req, res, next) {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
      deletedAt: null
    }).lean();

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    return res.json({ entry });
  } catch (error) {
    next(error);
  }
}

export async function createEntry(req, res, next) {
  try {
    const data = matchedData(req);
    const analysis = await analyzeJournalText(data.text);
    const finalMood = data.finalMood || data.manualMood;
    const wordCount = countWords(data.text);

    const entry = await JournalEntry.create({
      userId: req.user._id,
      entryDate: normalizeEntryDate(data.entryDate),
      text: data.text,
      manualMood: data.manualMood,
      detectedMood: analysis.detectedMood,
      emotionSignals: analysis.signals,
      finalMood,
      status: data.status || "final",
      sentimentScore: analysis.sentimentScore,
      analysisSource: analysis.analysisSource,
      wordCount,
      promptUsed: data.promptUsed || ""
    });

    const [userProgress, suggestion] = await Promise.all([
      recomputeUserProgress(req.user._id),
      getHistoryBasedSuggestion({
        userId: req.user._id,
        includeDrafts: entry.status === "draft"
      })
    ]);

    return res.status(201).json({
      entry,
      suggestion,
      distressSupport: detectDistressLanguage(data.text),
      streakCount: userProgress?.streakCount || 0,
      badges: userProgress?.badges || []
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEntry(req, res, next) {
  try {
    const data = matchedData(req);
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
      deletedAt: null
    });

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    const analysis = await analyzeJournalText(data.text);
    const wordCount = countWords(data.text);
    entry.entryDate = normalizeEntryDate(data.entryDate);
    entry.text = data.text;
    entry.manualMood = data.manualMood;
    entry.detectedMood = analysis.detectedMood;
    entry.emotionSignals = analysis.signals;
    entry.finalMood = data.finalMood || data.manualMood;
    entry.status = data.status || entry.status;
    entry.sentimentScore = analysis.sentimentScore;
    entry.analysisSource = analysis.analysisSource;
    entry.wordCount = wordCount;
    entry.promptUsed = data.promptUsed || entry.promptUsed;

    await entry.save();

    const [userProgress, suggestion] = await Promise.all([
      recomputeUserProgress(req.user._id),
      getHistoryBasedSuggestion({
        userId: req.user._id,
        includeDrafts: entry.status === "draft"
      })
    ]);

    return res.json({
      entry,
      suggestion,
      distressSupport: detectDistressLanguage(data.text),
      streakCount: userProgress?.streakCount || 0,
      badges: userProgress?.badges || []
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEntry(req, res, next) {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
      deletedAt: null
    });

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    entry.deletedAt = new Date();
    await entry.save();
    await recomputeUserProgress(req.user._id);

    return res.json({ message: "Journal entry removed." });
  } catch (error) {
    next(error);
  }
}

export async function shareEntryWithHelper(req, res, next) {
  try {
    const { helperId } = matchedData(req);
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
      deletedAt: null
    });

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    if (!req.user.consentSettings.allowHelperSharing) {
      return res.status(400).json({
        message: "Enable helper sharing in settings before sharing entries."
      });
    }

    const helper = await User.findOne({
      _id: helperId,
      role: ROLES.HELPER,
      isActive: true
    });

    if (!helper) {
      return res.status(404).json({ message: "Helper account not found." });
    }

    const access = await SharedAccess.findOneAndUpdate(
      { userId: req.user._id, helperId },
      {
        $setOnInsert: {
          sharingScope: "selected",
          consentGrantedAt: new Date()
        },
        $addToSet: {
          sharedEntryIds: new mongoose.Types.ObjectId(req.params.id)
        },
        $set: {
          revokedAt: null
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    return res.json({
      message: `Entry shared with ${helper.fullName}.`,
      access
    });
  } catch (error) {
    next(error);
  }
}
