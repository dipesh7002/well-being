import { env } from "../config/env.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { Suggestion } from "../models/Suggestion.js";
import { DISTRESS_KEYWORDS, MOOD_OPTIONS } from "../utils/constants.js";
import { countWords } from "../utils/text.js";

const POSITIVE_WORDS = [
  "grateful",
  "joy",
  "joyful",
  "good",
  "great",
  "happy",
  "relieved",
  "hopeful",
  "excited",
  "peaceful",
  "calm",
  "lighter",
  "supported",
  "steady",
  "grounded"
];

const NEGATIVE_WORDS = [
  "sad",
  "tired",
  "overwhelmed",
  "angry",
  "upset",
  "lonely",
  "hopeless",
  "burned out",
  "heavy",
  "numb",
  "feeling low"
];

const STRESS_WORDS = [
  "deadline",
  "deadlines",
  "pressure",
  "stress",
  "stressed",
  "busy",
  "exhausted",
  "tense",
  "overloaded",
  "burnt out",
  "spread thin",
  "too much"
];

const ANXIETY_WORDS = [
  "anxious",
  "panic",
  "panicking",
  "worried",
  "fear",
  "nervous",
  "uneasy",
  "racing thoughts",
  "restless",
  "on edge",
  "can't stop worrying"
];

const SIGNAL_KEYS = ["anxious", "stressed", "sad", "calm", "happy"];
const LOW_MOOD_SET = new Set(["sad", "stressed", "anxious"]);
const MOOD_SCORE_MAP = Object.fromEntries(
  MOOD_OPTIONS.map((mood) => [mood.value, mood.score])
);
const VALID_MOODS = new Set(MOOD_OPTIONS.map((mood) => mood.value));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(text, lexicon) {
  return lexicon.reduce(
    (total, word) =>
      total +
      (new RegExp(`(^|\\b)${escapeRegExp(word.toLowerCase()).replace(/\s+/g, "\\s+")}(\\b|$)`).test(text)
        ? 1
        : 0),
    0
  );
}

function createEmptySignals() {
  return {
    anxious: 0,
    stressed: 0,
    sad: 0,
    calm: 0,
    happy: 0
  };
}

function normalizeSignals(signals = {}) {
  const normalized = createEmptySignals();

  SIGNAL_KEYS.forEach((key) => {
    normalized[key] = Number(signals[key] || 0);
  });

  return normalized;
}

function normalizeMood(value) {
  return VALID_MOODS.has(value) ? value : "neutral";
}

function finalizeAnalysis({ detectedMood, sentimentScore, signals, analysisSource }) {
  return {
    detectedMood: detectedMood ? normalizeMood(detectedMood) : null,
    sentimentScore:
      typeof sentimentScore === "number" && Number.isFinite(sentimentScore)
        ? Number(sentimentScore.toFixed(2))
        : null,
    signals: normalizeSignals(signals),
    analysisSource
  };
}

function runInternalAnalysis(text) {
  const normalized = text.toLowerCase();
  const positiveHits = countMatches(normalized, POSITIVE_WORDS);
  const negativeHits = countMatches(normalized, NEGATIVE_WORDS);
  const stressHits = countMatches(normalized, STRESS_WORDS);
  const anxietyHits = countMatches(normalized, ANXIETY_WORDS);
  const calmHits = countMatches(normalized, ["calm", "peaceful", "steady", "grounded", "okay", "settled"]);
  const happyHits = countMatches(normalized, ["happy", "joy", "joyful", "grateful", "excited", "hopeful", "proud"]);

  const scoreBase =
    happyHits * 1.2 +
    calmHits * 0.75 +
    positiveHits * 0.55 -
    negativeHits * 0.9 -
    stressHits * 0.95 -
    anxietyHits * 1.1;
  const wordCount = Math.max(countWords(normalized), 5);
  const sentimentScore = Number(Math.max(-1, Math.min(1, scoreBase / Math.max(wordCount / 6, 2))).toFixed(2));

  let detectedMood = "neutral";

  if (anxietyHits > 0 && anxietyHits >= stressHits) {
    detectedMood = "anxious";
  } else if (stressHits > 0) {
    detectedMood = "stressed";
  } else if (negativeHits > 0) {
    detectedMood = "sad";
  } else if (happyHits > 0 || positiveHits > negativeHits + calmHits) {
    detectedMood = happyHits > 1 || sentimentScore >= 0.45 ? "happy" : "calm";
  } else if (calmHits > 0) {
    detectedMood = "calm";
  } else if (sentimentScore <= -0.45) {
    detectedMood = "sad";
  } else if (sentimentScore <= -0.15) {
    detectedMood = "stressed";
  } else if (sentimentScore >= 0.45) {
    detectedMood = "happy";
  } else if (sentimentScore >= 0.15) {
    detectedMood = "calm";
  }

  return finalizeAnalysis({
    detectedMood,
    sentimentScore,
    signals: {
      anxious: anxietyHits,
      stressed: stressHits,
      sad: negativeHits,
      calm: calmHits,
      happy: happyHits
    },
    analysisSource: "internal"
  });
}

async function runPythonAnalysis(text) {
  if (!env.pythonAiUrl) {
    throw new Error("Python AI URL is not configured.");
  }

  const response = await fetch(env.pythonAiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(2500)
  });

  if (!response.ok) {
    throw new Error("Python AI service unavailable.");
  }

  const payload = await response.json();

  if (!payload?.detectedMood || typeof payload.sentimentScore !== "number") {
    throw new Error("Python AI service returned an invalid response.");
  }

  return finalizeAnalysis({
    detectedMood: payload.detectedMood,
    sentimentScore: payload.sentimentScore,
    signals: payload.signals,
    analysisSource: "python"
  });
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getWordCountForEntry(entry) {
  return entry.wordCount || countWords(entry.text);
}

function getRecentMoodCounts(entries) {
  return entries.reduce((accumulator, entry) => {
    accumulator[entry.finalMood] = (accumulator[entry.finalMood] || 0) + 1;
    return accumulator;
  }, {});
}

function buildHistorySuggestion(baseSuggestion, entries) {
  const latestEntry = entries[0];

  if (!latestEntry) {
    return {
      ...baseSuggestion,
      reason: "Based on your latest check-in."
    };
  }

  const recentEntries = entries.slice(0, 3);
  const olderEntries = entries.slice(3, 6);
  const recentMoodCounts = getRecentMoodCounts(recentEntries);
  const recentLowMoodCount = recentEntries.filter((entry) => LOW_MOOD_SET.has(entry.finalMood)).length;
  const latestMood = latestEntry.finalMood;
  const latestWordCount = getWordCountForEntry(latestEntry);
  const averageWordCount = Math.round(average(entries.map(getWordCountForEntry)));
  const recentAverageScore = average(
    recentEntries.map((entry) => MOOD_SCORE_MAP[entry.finalMood] || MOOD_SCORE_MAP.neutral)
  );
  const olderAverageScore = average(
    olderEntries.map((entry) => MOOD_SCORE_MAP[entry.finalMood] || MOOD_SCORE_MAP.neutral)
  );

  if (recentMoodCounts.anxious >= 2 || (latestMood === "anxious" && recentLowMoodCount >= 2)) {
    return {
      ...baseSuggestion,
      title: "Shrink the next hour",
      description:
        "Your recent entries keep leaning anxious. Choose one small next step, lower one expectation, and let your body slow down before tackling more.",
      reason: "Based on your last few entries repeatedly leaning anxious."
    };
  }

  if (recentMoodCounts.stressed >= 2 || (latestMood === "stressed" && recentLowMoodCount >= 2)) {
    return {
      ...baseSuggestion,
      title: "Protect a short recovery pocket",
      description:
        "Your recent entries suggest sustained pressure. Try a brief reset window today: water, movement, and one task you can postpone without guilt.",
      reason: "Based on repeated stress showing up across your recent entries."
    };
  }

  if (recentMoodCounts.sad >= 2 || (latestMood === "sad" && recentLowMoodCount >= 2)) {
    return {
      ...baseSuggestion,
      title: "Add one gentle point of support",
      description:
        "Your recent reflections have been heavier. Keep today simple: name one comforting action or one person you could reach toward for steadiness.",
      reason: "Based on sadness showing up more than once in your recent entries."
    };
  }

  if (recentLowMoodCount >= 3) {
    return {
      ...baseSuggestion,
      title: "Keep your care plan small and repeatable",
      description:
        "A few recent entries have been carrying a lot. Focus on the next tiny support habit you can realistically repeat for the next two days.",
      reason: "Based on several recent entries clustering around lower-energy moods."
    };
  }

  if (olderEntries.length >= 2 && recentAverageScore - olderAverageScore >= 0.75 && !LOW_MOOD_SET.has(latestMood)) {
    return {
      ...baseSuggestion,
      title: "Notice what is helping",
      description:
        "Your recent entries look a little steadier than the ones before them. Write down what has eased, even slightly, so you can return to it later.",
      reason: "Based on your recent mood trend looking steadier than your earlier entries."
    };
  }

  if (averageWordCount >= 80 && latestWordCount >= averageWordCount * 1.15) {
    return {
      ...baseSuggestion,
      title: "Writing seems to be helping you process",
      description:
        "This entry is longer than your recent average. Consider ending with one sentence about what feels clearest to you right now.",
      reason: "Based on this entry being more detailed than your recent writing pattern."
    };
  }

  if (latestWordCount > 0 && latestWordCount <= 20 && LOW_MOOD_SET.has(latestMood)) {
    return {
      ...baseSuggestion,
      title: "Give yourself one more sentence",
      description:
        "This was a short but important check-in. If you have the energy later, add one extra sentence about what feels hardest or what might help next.",
      reason: "Based on a brief check-in landing on a lower-energy mood."
    };
  }

  return {
    ...baseSuggestion,
    reason: "Based on your recent mood pattern and latest entry."
  };
}

export async function analyzeJournalText(text) {
  if (!text?.trim()) {
    return finalizeAnalysis({
      detectedMood: null,
      sentimentScore: null,
      signals: createEmptySignals(),
      analysisSource: "off"
    });
  }

  if (env.aiMode === "off") {
    return finalizeAnalysis({
      detectedMood: null,
      sentimentScore: null,
      signals: createEmptySignals(),
      analysisSource: "off"
    });
  }

  if (env.aiMode === "python") {
    try {
      return await runPythonAnalysis(text);
    } catch (error) {
      return runInternalAnalysis(text);
    }
  }

  return runInternalAnalysis(text);
}

export async function getHistoryBasedSuggestion({ userId, includeDrafts = false }) {
  const entries = await JournalEntry.find({
    userId,
    deletedAt: null,
    ...(includeDrafts ? {} : { status: "final" })
  })
    .sort({ entryDate: -1, createdAt: -1 })
    .limit(6)
    .lean();

  const latestMood = entries[0]?.finalMood || "neutral";
  const baseSuggestion = await getSuggestionForMood(latestMood);

  return buildHistorySuggestion(baseSuggestion, entries);
}

export function detectDistressLanguage(text) {
  const normalized = text.toLowerCase();
  const matchedKeywords = DISTRESS_KEYWORDS.filter((keyword) => normalized.includes(keyword));

  if (matchedKeywords.length === 0) {
    return null;
  }

  return {
    title: "Extra support may help right now",
    message:
      "Your words suggest you may be carrying a lot. If you feel unsafe or at risk, please consider reaching out to a trusted person or a local crisis support line.",
    matchedKeywords,
    resourceLink: env.resourceUrl
  };
}

export async function getSuggestionForMood(mood) {
  const suggestion = await Suggestion.findOne({ mood }).lean();

  if (suggestion) {
    return suggestion;
  }

  return {
    mood,
    title: "Take a gentle pause",
    description: "Notice what you need most right now and choose one small act of care.",
    resourceLink: ""
  };
}
