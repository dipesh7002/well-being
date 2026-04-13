import { describe, expect, it, vi } from "vitest";
import { env } from "../src/config/env.js";
import { Suggestion } from "../src/models/Suggestion.js";
import {
  analyzeJournalText,
  detectDistressLanguage,
  getHistoryBasedSuggestion,
  getSuggestionForMood
} from "../src/services/journalInsightService.js";
import { createJournalEntry, createUser } from "./helpers/factories.js";

describe("journalInsightService", () => {
  it("returns null analysis when AI is turned off or the text is empty", async () => {
    env.aiMode = "off";

    await expect(analyzeJournalText("")).resolves.toEqual({
      detectedMood: null,
      sentimentScore: null,
      signals: {
        anxious: 0,
        stressed: 0,
        sad: 0,
        calm: 0,
        happy: 0
      },
      analysisSource: "off"
    });
    await expect(analyzeJournalText("Today felt okay")).resolves.toEqual({
      detectedMood: null,
      sentimentScore: null,
      signals: {
        anxious: 0,
        stressed: 0,
        sad: 0,
        calm: 0,
        happy: 0
      },
      analysisSource: "off"
    });
  });

  it("uses the internal analyzer when AI mode is internal", async () => {
    env.aiMode = "internal";

    const result = await analyzeJournalText("I feel anxious and my mind is full of racing thoughts.");

    expect(result.detectedMood).toBe("anxious");
    expect(result.sentimentScore).toBeLessThan(0);
    expect(result.analysisSource).toBe("internal");
    expect(result.signals.anxious).toBeGreaterThan(0);
  });

  it("uses the Python AI result when the external service succeeds", async () => {
    env.aiMode = "python";
    env.pythonAiUrl = "https://example.com/analyze";

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        detectedMood: "calm",
        sentimentScore: 0.71,
        signals: {
          anxious: 0,
          stressed: 0,
          sad: 0,
          calm: 2,
          happy: 0
        }
      })
    });

    await expect(analyzeJournalText("Today felt steady and light.")).resolves.toEqual({
      detectedMood: "calm",
      sentimentScore: 0.71,
      signals: {
        anxious: 0,
        stressed: 0,
        sad: 0,
        calm: 2,
        happy: 0
      },
      analysisSource: "python"
    });
  });

  it("falls back to the internal analyzer when the Python service fails", async () => {
    env.aiMode = "python";
    env.pythonAiUrl = "https://example.com/analyze";

    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network down"));

    const result = await analyzeJournalText("I am stressed about a deadline and feeling overloaded.");

    expect(result.detectedMood).toBe("stressed");
    expect(result.sentimentScore).toBeLessThan(0);
    expect(result.analysisSource).toBe("internal");
  });

  it("detects distress language and returns the configured resource link", () => {
    env.resourceUrl = "https://example.com/support";

    const result = detectDistressLanguage("I feel hopeless and worthless tonight.");

    expect(result).toMatchObject({
      title: "Extra support may help right now",
      resourceLink: "https://example.com/support"
    });
    expect(result.matchedKeywords).toEqual(expect.arrayContaining(["hopeless", "worthless"]));
  });

  it("returns a stored suggestion when one exists and a fallback otherwise", async () => {
    await Suggestion.create({
      mood: "happy",
      title: "Celebrate the moment",
      description: "Write down what went well today.",
      resourceLink: "https://example.com/happy"
    });

    await expect(getSuggestionForMood("happy")).resolves.toMatchObject({
      title: "Celebrate the moment"
    });
    await expect(getSuggestionForMood("neutral")).resolves.toMatchObject({
      mood: "neutral",
      title: "Take a gentle pause"
    });
  });

  it("builds history-based suggestions from repeated recent patterns", async () => {
    const user = await createUser();

    await createJournalEntry({
      user,
      entryDate: new Date("2024-09-06T12:00:00.000Z"),
      text: "I feel overloaded and tense today with too much on my plate.",
      manualMood: "stressed",
      finalMood: "stressed",
      wordCount: 26
    });
    await createJournalEntry({
      user,
      entryDate: new Date("2024-09-05T12:00:00.000Z"),
      text: "I still feel stressed and burned out by the pressure this week.",
      manualMood: "stressed",
      finalMood: "stressed",
      wordCount: 21
    });
    await createJournalEntry({
      user,
      entryDate: new Date("2024-09-04T12:00:00.000Z"),
      text: "Today was calm enough to breathe again.",
      manualMood: "calm",
      finalMood: "calm",
      wordCount: 8
    });

    await expect(
      getHistoryBasedSuggestion({
        userId: user._id,
        includeDrafts: false
      })
    ).resolves.toMatchObject({
      title: "Protect a short recovery pocket",
      reason: "Based on repeated stress showing up across your recent entries."
    });
  });
});
