export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  HELPER: "helper"
};

export const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", emoji: "😊", score: 5 },
  { value: "calm", label: "Calm", emoji: "😌", score: 4 },
  { value: "neutral", label: "Neutral", emoji: "🙂", score: 3 },
  { value: "stressed", label: "Stressed", emoji: "😥", score: 2 },
  { value: "anxious", label: "Anxious", emoji: "😟", score: 1 },
  { value: "sad", label: "Sad", emoji: "😔", score: 1 }
];

export const BADGE_SEED = [
  {
    name: "7-Day Reflection",
    slug: "7-day-streak",
    description: "Completed a 7-day journaling streak.",
    thresholdDays: 7,
    icon: "spark"
  },
  {
    name: "Two-Week Anchor",
    slug: "14-day-streak",
    description: "Stayed present with journaling for 14 days.",
    thresholdDays: 14,
    icon: "sunrise"
  },
  {
    name: "30-Day Glow",
    slug: "30-day-streak",
    description: "Built a 30-day reflection habit.",
    thresholdDays: 30,
    icon: "crown"
  }
];

export const PROMPT_SEED = [
  {
    text: "What felt grounding or steady for you today?",
    targetMoods: ["calm", "neutral"],
    isActive: true
  },
  {
    text: "What made you smile today, even briefly?",
    targetMoods: ["happy"],
    isActive: true
  },
  {
    text: "What made you feel a little better today?",
    targetMoods: ["stressed"],
    isActive: true
  },
  {
    text: "What is one kind thing you can say to yourself right now?",
    targetMoods: ["sad"],
    isActive: true
  },
  {
    text: "What would help you feel 5% safer or lighter today?",
    targetMoods: ["anxious"],
    isActive: true
  },
  {
    text: "What do you want to remember about today?",
    targetMoods: [],
    isActive: true
  }
];

export const SUGGESTION_SEED = [
  {
    mood: "anxious",
    title: "Try a gentle breathing reset",
    description: "Pause for one minute and breathe in for four counts, then out for six counts.",
    resourceLink: ""
  },
  {
    mood: "sad",
    title: "Offer yourself a softer reflection",
    description: "Write down one small act of care you can give yourself today, even if it feels simple.",
    resourceLink: ""
  },
  {
    mood: "stressed",
    title: "Take a short reset break",
    description: "Stand up, stretch your shoulders, drink water, and step away from your screen for a moment.",
    resourceLink: ""
  },
  {
    mood: "happy",
    title: "Celebrate and reinforce the moment",
    description: "Capture what contributed to this feeling so you can return to it on harder days.",
    resourceLink: ""
  },
  {
    mood: "calm",
    title: "Protect the calm",
    description: "Notice what helped create this steadiness and how you can make room for it again tomorrow.",
    resourceLink: ""
  },
  {
    mood: "neutral",
    title: "Check in with curiosity",
    description: "A neutral day still matters. Try noting one thing that felt routine and one thing that felt meaningful.",
    resourceLink: ""
  }
];

export const DISTRESS_KEYWORDS = [
  "hopeless",
  "self harm",
  "suicide",
  "can't go on",
  "kill myself",
  "worthless",
  "end it",
  "hurt myself"
];

