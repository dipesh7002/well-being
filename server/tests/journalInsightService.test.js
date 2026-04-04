import { describe, expect, it, vi } from "vitest";
import { env } from "../src/config/env.js";
import { Suggestion } from "../src/models/Suggestion.js";
import {
  analyzeJournalText,
  detectDistressLanguage,
  getSuggestionForMood
} from "../src/services/journalInsightService.js";

describe("journalInsightService", () => {
  it("returns null analysis when AI is turned off or the text is empty", async () => {
    env.aiMode = "off";

    await expect(analyzeJournalText("")).resolves.toEqual({
      detectedMood: null,
      sentimentScore: null
    });
    await expect(analyzeJournalText("Today felt okay")).resolves.toEqual({
      detectedMood: null,
      sentimentScore: null
    });
  });

  it("uses the internal analyzer when AI mode is internal", async () => {
    env.aiMode = "internal";

    const result = await analyzeJournalText("I feel anxious and my mind is full of racing thoughts.");

    expect(result.detectedMood).toBe("anxious");
    expect(result.sentimentScore).toBeLessThan(0);
  });

  it("uses the Python AI result when the external service succeeds", async () => {
    env.aiMode = "python";
    env.pythonAiUrl = "https://example.com/analyze";

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        detectedMood: "calm",
        sentimentScore: 0.71
      })
    });

    await expect(analyzeJournalText("Today felt steady and light.")).resolves.toEqual({
      detectedMood: "calm",
      sentimentScore: 0.71
    });
  });

  it("falls back to the internal analyzer when the Python service fails", async () => {
    env.aiMode = "python";
    env.pythonAiUrl = "https://example.com/analyze";

    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network down"));

    const result = await analyzeJournalText("I am stressed about a deadline and feeling overloaded.");

    expect(result.detectedMood).toBe("stressed");
    expect(result.sentimentScore).toBeLessThan(0);
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
});
