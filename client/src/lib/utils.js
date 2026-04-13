import { format } from "date-fns";
import { moodMeta } from "../data/moodMeta";

export function cn(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export function formatFriendlyDate(value) {
  if (!value) return "No date";
  return format(new Date(value), "MMM d, yyyy");
}

export function formatDateInput(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

export function countWords(text = "") {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getMoodMeta(mood) {
  return moodMeta[mood] || moodMeta.neutral;
}

export function toTitleCase(value) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

