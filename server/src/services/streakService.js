import { Badge } from "../models/Badge.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { User } from "../models/User.js";
import { getTodayKey, isConsecutiveDay, dayKeyToDate, toDayKey } from "../utils/date.js";

function calculateCurrentStreak(dayKeys) {
  if (dayKeys.length === 0) {
    return { streakCount: 0, lastJournalDate: null };
  }

  const sorted = [...dayKeys].sort();
  const latest = sorted[sorted.length - 1];
  const todayKey = getTodayKey();
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = toDayKey(yesterday);

  if (latest !== todayKey && latest !== yesterdayKey) {
    return {
      streakCount: 0,
      lastJournalDate: dayKeyToDate(latest)
    };
  }

  let streakCount = 1;

  for (let index = sorted.length - 1; index > 0; index -= 1) {
    if (isConsecutiveDay(sorted[index - 1], sorted[index])) {
      streakCount += 1;
    } else {
      break;
    }
  }

  return {
    streakCount,
    lastJournalDate: dayKeyToDate(latest)
  };
}

export async function recomputeUserProgress(userId) {
  const entries = await JournalEntry.find({
    userId,
    deletedAt: null,
    status: "final"
  })
    .select("entryDate")
    .sort({ entryDate: 1 })
    .lean();

  const uniqueDayKeys = [...new Set(entries.map((entry) => toDayKey(entry.entryDate)))];
  const { streakCount, lastJournalDate } = calculateCurrentStreak(uniqueDayKeys);

  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  const badges = await Badge.find({
    thresholdDays: { $lte: streakCount }
  })
    .sort({ thresholdDays: 1 })
    .lean();

  user.streakCount = streakCount;
  user.lastJournalDate = lastJournalDate;
  const existingAwards = new Map(
    user.badges.map((badge) => [badge.slug, badge.awardedAt || new Date()])
  );

  user.badges = badges.map((badge) => ({
    slug: badge.slug,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    awardedAt: existingAwards.get(badge.slug) || new Date()
  }));

  await user.save();

  return user;
}
