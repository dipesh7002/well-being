import { env } from "../config/env.js";
import { Suggestion } from "../models/Suggestion.js";
import { DISTRESS_KEYWORDS } from "../utils/constants.js";

const POSITIVE_WORDS = [
  "grateful",
  "joy",
  "good",
  "great",
  "happy",
  "relieved",
  "hopeful",
  "excited",
  "peaceful",
  "calm"
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
  "numb"
];

const STRESS_WORDS = [
  "deadline",
  "pressure",
  "stress",
  "stressed",
  "busy",
  "exhausted",
  "tense",
  "overloaded"
];

const ANXIETY_WORDS = [
  "anxious",
  "panic",
  "worried",
  "fear",
  "nervous",
  "uneasy",
  "racing thoughts"
];

function countMatches(text, lexicon) {
  return lexicon.reduce(
    (total, word) => total + (text.includes(word.toLowerCase()) ? 1 : 0),
    0
  );
}

function runInternalAnalysis(text) {
  const normalized = text.toLowerCase();
  const positiveHits = countMatches(normalized, POSITIVE_WORDS);
  const negativeHits = countMatches(normalized, NEGATIVE_WORDS);
  const stressHits = countMatches(normalized, STRESS_WORDS);
  const anxietyHits = countMatches(normalized, ANXIETY_WORDS);

  const scoreBase = positiveHits - negativeHits - stressHits - anxietyHits;
  const sentimentScore = Number((scoreBase / Math.max(normalized.split(/\s+/).length, 5)).toFixed(2));

  let detectedMood = "neutral";

  if (anxietyHits > 0) {
    detectedMood = "anxious";
  } else if (stressHits > 0) {
    detectedMood = "stressed";
  } else if (positiveHits > negativeHits) {
    detectedMood = positiveHits > 1 ? "happy" : "calm";
  } else if (negativeHits > 0) {
    detectedMood = "sad";
  }

  return {
    detectedMood,
    sentimentScore
  };
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

  return payload;
}

export async function analyzeJournalText(text) {
  if (!text?.trim() || env.aiMode === "off") {
    return {
      detectedMood: null,
      sentimentScore: null
    };
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
