import { JournalEntry } from "../models/JournalEntry.js";
import { getUserAnalytics } from "../services/analyticsService.js";
import { getPromptForMood } from "../services/promptService.js";
import { getHistoryBasedSuggestion } from "../services/journalInsightService.js";
import { getTodayKey, toDayKey } from "../utils/date.js";

export async function getDashboardSummary(req, res, next) {
  try {
    const [recentEntries, todayFinalEntry] = await Promise.all([
      JournalEntry.find({
        userId: req.user._id,
        deletedAt: null
      })
        .sort({ entryDate: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      JournalEntry.findOne({
        userId: req.user._id,
        deletedAt: null,
        status: "final"
      })
        .sort({ entryDate: -1, createdAt: -1 })
        .lean()
    ]);

    const recentMood =
      recentEntries.find((entry) => entry.status === "final")?.finalMood ||
      recentEntries[0]?.finalMood ||
      null;
    const todayJournaled = Boolean(
      todayFinalEntry && toDayKey(todayFinalEntry.entryDate) === getTodayKey()
    );
    const analytics = await getUserAnalytics(req.user._id);
    const prompt = await getPromptForMood(recentMood);
    const suggestion = await getHistoryBasedSuggestion({
      userId: req.user._id,
      includeDrafts: false
    });

    return res.json({
      greetingName: req.user.fullName.split(" ")[0],
      todayJournaled,
      currentStreak: req.user.streakCount,
      badges: req.user.badges,
      reminder: req.user.reminderEnabled
        ? {
            enabled: true,
            reminderTime: req.user.reminderTime,
            needsAttention: !todayJournaled
          }
        : {
            enabled: false,
            reminderTime: null,
            needsAttention: false
          },
      moodOverview: {
        recentMood,
        distribution: analytics.distribution
      },
      recentEntries,
      guidedPrompt: prompt,
      selfCareSuggestion: suggestion,
      wordInsight: analytics.wordInsights,
      analyticsPreview: {
        dailyTrend: analytics.dailyTrend.slice(-14),
        weeklyTrend: analytics.weeklyTrend.slice(-8)
      }
    });
  } catch (error) {
    next(error);
  }
}
