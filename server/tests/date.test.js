import { describe, expect, it } from "vitest";
import {
  dayKeyToDate,
  isConsecutiveDay,
  isToday,
  isYesterday,
  normalizeEntryDate,
  toDayKey
} from "../src/utils/date.js";

describe("date utils", () => {
  it("normalizes a date-only string to a UTC day key", () => {
    const value = normalizeEntryDate("2024-09-02");

    expect(value.toISOString()).toBe("2024-09-02T12:00:00.000Z");
    expect(toDayKey(value)).toBe("2024-09-02");
    expect(dayKeyToDate("2024-09-02").toISOString()).toBe("2024-09-02T12:00:00.000Z");
  });

  it("detects consecutive days correctly", () => {
    expect(isConsecutiveDay("2024-09-01", "2024-09-02")).toBe(true);
    expect(isConsecutiveDay("2024-09-01", "2024-09-03")).toBe(false);
  });

  it("detects today and yesterday using normalized keys", () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    expect(isToday(today)).toBe(true);
    expect(isYesterday(yesterday)).toBe(true);
  });
});
