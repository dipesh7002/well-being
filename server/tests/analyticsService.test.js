import { describe, expect, it } from "vitest";
import { JournalEntry } from "../src/models/JournalEntry.js";
import { getAdminAnalytics, getUserAnalytics } from "../src/services/analyticsService.js";
import { createUser } from "./helpers/factories.js";

describe("analyticsService", () => {
  it("builds user analytics with daily, weekly, and distribution summaries", async () => {
    const user = await createUser();

    await JournalEntry.create([
      {
        userId: user._id,
        entryDate: new Date("2024-01-01T12:00:00.000Z"),
        text: "Calm start",
        manualMood: "calm",
        finalMood: "calm",
        status: "final"
      },
      {
        userId: user._id,
        entryDate: new Date("2024-01-01T13:00:00.000Z"),
        text: "Another calm note",
        manualMood: "calm",
        finalMood: "calm",
        status: "final"
      },
      {
        userId: user._id,
        entryDate: new Date("2024-01-09T12:00:00.000Z"),
        text: "Happy check-in",
        manualMood: "happy",
        finalMood: "happy",
        status: "final"
      },
      {
        userId: user._id,
        entryDate: new Date("2024-01-10T12:00:00.000Z"),
        text: "Draft should be ignored",
        manualMood: "sad",
        finalMood: "sad",
        status: "draft"
      }
    ]);

    const analytics = await getUserAnalytics(user._id);

    expect(analytics.totalEntries).toBe(3);
    expect(analytics.dailyTrend).toEqual([
      { day: "2024-01-01", mood: "calm", count: 2 },
      { day: "2024-01-09", mood: "happy", count: 1 }
    ]);
    expect(analytics.weeklyTrend).toEqual([
      expect.objectContaining({
        week: "2024-01-01",
        total: 2
      }),
      expect.objectContaining({
        week: "2024-01-08",
        total: 1
      })
    ]);
    expect(analytics.distribution).toMatchObject({
      calm: 2,
      happy: 1,
      sad: 0
    });
    expect(analytics.wordInsights).toMatchObject({
      latest: 2,
      average: 2,
      recentAverage: 2,
      longest: 3,
      totalWords: 7,
      trend: "steady"
    });
  });

  it("builds admin analytics across users, moods, and streak buckets", async () => {
    await createUser({
      role: "user",
      streakCount: 0,
      lastJournalDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    });
    await createUser({
      role: "admin",
      streakCount: 5,
      lastJournalDate: new Date()
    });
    await createUser({
      role: "helper",
      streakCount: 9,
      lastJournalDate: new Date()
    });

    await JournalEntry.create([
      {
        userId: (await createUser())._id,
        entryDate: new Date("2024-02-01T12:00:00.000Z"),
        text: "Happy entry",
        manualMood: "happy",
        finalMood: "happy",
        status: "final"
      },
      {
        userId: (await createUser())._id,
        entryDate: new Date("2024-02-01T13:00:00.000Z"),
        text: "Sad entry",
        manualMood: "sad",
        finalMood: "sad",
        status: "final"
      }
    ]);

    const analytics = await getAdminAnalytics();

    expect(analytics.totalUsers).toBe(5);
    expect(analytics.activeUsers).toBe(2);
    expect(analytics.entryCountsByDay).toEqual([{ day: "2024-02-01", count: 2 }]);
    expect(analytics.moodCountsAggregated).toMatchObject({
      happy: 1,
      sad: 1
    });
    expect(analytics.streakCountsAggregated).toMatchObject({
      "0": 3,
      "1-6": 1,
      "7-13": 1
    });
    expect(analytics.roleDistribution).toMatchObject({
      user: 3,
      admin: 1,
      helper: 1
    });
  });
});
