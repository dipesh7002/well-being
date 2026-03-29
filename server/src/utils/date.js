function normalizeDateInput(input) {
  if (!input) {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12)
    );
  }

  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
  }

  const parsed = new Date(input);
  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 12)
  );
}

export function getTodayKey() {
  return toDayKey(new Date());
}

export function toDayKey(date) {
  return normalizeDateInput(date).toISOString().slice(0, 10);
}

export function dayKeyToDate(dayKey) {
  return normalizeDateInput(dayKey);
}

export function isConsecutiveDay(previousKey, currentKey) {
  const previous = dayKeyToDate(previousKey);
  const current = dayKeyToDate(currentKey);
  const difference = current.getTime() - previous.getTime();
  return difference === 24 * 60 * 60 * 1000;
}

export function normalizeEntryDate(value) {
  return normalizeDateInput(value);
}

export function isToday(date) {
  return toDayKey(date) === getTodayKey();
}

export function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return toDayKey(date) === toDayKey(yesterday);
}

