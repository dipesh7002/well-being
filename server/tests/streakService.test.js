import { describe, expect, it } from "vitest";
import { Badge } from "../src/models/Badge.js";
import { JournalEntry } from "../src/models/JournalEntry.js";
import { recomputeUserProgress } from "../src/services/streakService.js";
import { createUser } from "./helpers/factories.js";

function daysAgo(count) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - count);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

describe("streakService", () => {
  it("recomputes the current streak and awards badges for qualifying days", async () => {
    const user = await createUser({ badges: [] });

    await Badge.create({
      name: "7-Day Reflection",
      slug: "7-day-streak",
      description: "Completed a 7-day journaling streak.",
      thresholdDays: 7,
      icon: "spark"
    });

    await Promise.all(
      Array.from({ length: 7 }, (_, index) =>
        JournalEntry.create({
          userId: user._id,
          entryDate: daysAgo(6 - index),
          text: `Entry ${index + 1}`,
          manualMood: "calm",
          finalMood: "calm",
          status: "final"
        })
      )
    );

    await JournalEntry.create({
      userId: user._id,
      entryDate: daysAgo(0),
      text: "Draft should not count",
      manualMood: "neutral",
      finalMood: "neutral",
      status: "draft"
    });

    const updatedUser = await recomputeUserProgress(user._id);

    expect(updatedUser.streakCount).toBe(7);
    expect(updatedUser.badges).toHaveLength(1);
    expect(updatedUser.badges[0].slug).toBe("7-day-streak");
    expect(updatedUser.lastJournalDate.toISOString().slice(0, 10)).toBe(daysAgo(0).toISOString().slice(0, 10));
  });

  it("resets the streak when the most recent final entry is older than yesterday", async () => {
    const user = await createUser({ badges: [] });

    await Promise.all(
      [5, 4, 3].map((days) =>
        JournalEntry.create({
          userId: user._id,
          entryDate: daysAgo(days),
          text: `Older entry ${days}`,
          manualMood: "neutral",
          finalMood: "neutral",
          status: "final"
        })
      )
    );

    const updatedUser = await recomputeUserProgress(user._id);

    expect(updatedUser.streakCount).toBe(0);
    expect(updatedUser.lastJournalDate.toISOString().slice(0, 10)).toBe(daysAgo(3).toISOString().slice(0, 10));
  });
});
