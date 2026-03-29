export const moodMeta = {
  happy: { label: "Happy", emoji: "😊", color: "#fb923c" },
  calm: { label: "Calm", emoji: "😌", color: "#34d399" },
  neutral: { label: "Neutral", emoji: "🙂", color: "#a78bfa" },
  stressed: { label: "Stressed", emoji: "😥", color: "#f59e0b" },
  anxious: { label: "Anxious", emoji: "😟", color: "#f97316" },
  sad: { label: "Sad", emoji: "😔", color: "#fb7185" }
};

export const moodOptions = Object.entries(moodMeta).map(([value, meta]) => ({
  value,
  ...meta
}));

