import { JournalEntry } from "../models/JournalEntry.js";
import { User } from "../models/User.js";
import { toDayKey } from "../utils/date.js";

const DEFAULT_MOOD_COUNTS = {
  happy: 0,
  calm: 0,
  neutral: 0,
  stressed: 0,
  anxious: 0,
  sad: 0
};

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setUTCDate(copy.getUTCDate() + diff);
  copy.setUTCHours(12, 0, 0, 0);
  return copy;
}

export async function getUserAnalytics(userId) {
  const entries = await JournalEntry.find({
    userId,
    deletedAt: null,
    status: "final"
  })
    .sort({ entryDate: 1 })
    .lean();

  const dailyMap = new Map();
  const weeklyMap = new Map();
  const distribution = { ...DEFAULT_MOOD_COUNTS };

  entries.forEach((entry) => {
    const dayKey = toDayKey(entry.entryDate);
    dailyMap.set(dayKey, {
      day: dayKey,
      mood: entry.finalMood,
      count: (dailyMap.get(dayKey)?.count || 0) + 1
    });

    distribution[entry.finalMood] = (distribution[entry.finalMood] || 0) + 1;

    const weekKey = toDayKey(startOfWeek(entry.entryDate));
    const current = weeklyMap.get(weekKey) || { week: weekKey, total: 0, moods: { ...DEFAULT_MOOD_COUNTS } };
    current.total += 1;
    current.moods[entry.finalMood] = (current.moods[entry.finalMood] || 0) + 1;
    weeklyMap.set(weekKey, current);
  });

  return {
    dailyTrend: [...dailyMap.values()],
    weeklyTrend: [...weeklyMap.values()],
    distribution,
    totalEntries: entries.length
  };
}

export async function getAdminAnalytics() {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    isActive: true,
    lastJournalDate: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  const entries = await JournalEntry.find({ deletedAt: null, status: "final" }).lean();
  const entryCountsByDay = new Map();
  const moodCountsAggregated = { ...DEFAULT_MOOD_COUNTS };
  const streakBuckets = {
    "0": 0,
    "1-6": 0,
    "7-13": 0,
    "14-29": 0,
    "30+": 0
  };

  entries.forEach((entry) => {
    const dayKey = toDayKey(entry.entryDate);
    entryCountsByDay.set(dayKey, (entryCountsByDay.get(dayKey) || 0) + 1);
    moodCountsAggregated[entry.finalMood] = (moodCountsAggregated[entry.finalMood] || 0) + 1;
  });

  const users = await User.find().select("streakCount role isActive createdAt").lean();

  users.forEach((user) => {
    if (user.streakCount === 0) {
      streakBuckets["0"] += 1;
    } else if (user.streakCount < 7) {
      streakBuckets["1-6"] += 1;
    } else if (user.streakCount < 14) {
      streakBuckets["7-13"] += 1;
    } else if (user.streakCount < 30) {
      streakBuckets["14-29"] += 1;
    } else {
      streakBuckets["30+"] += 1;
    }
  });

  return {
    totalUsers,
    activeUsers,
    entryCountsByDay: [...entryCountsByDay.entries()]
      .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
      .map(([day, count]) => ({ day, count })),
    moodCountsAggregated,
    streakCountsAggregated: streakBuckets,
    roleDistribution: users.reduce(
      (accumulator, user) => {
        accumulator[user.role] = (accumulator[user.role] || 0) + 1;
        return accumulator;
      },
      {}
    )
  };
}
