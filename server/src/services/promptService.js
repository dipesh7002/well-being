import { Prompt } from "../models/Prompt.js";

export async function getPromptForMood(mood) {
  if (mood) {
    const moodPrompts = await Prompt.find({
      isActive: true,
      targetMoods: mood
    }).lean();

    if (moodPrompts.length > 0) {
      return moodPrompts[Math.floor(Math.random() * moodPrompts.length)];
    }
  }

  const defaultPrompts = await Prompt.find({
    isActive: true,
    $or: [{ targetMoods: { $size: 0 } }, { targetMoods: { $exists: false } }]
  }).lean();

  if (defaultPrompts.length > 0) {
    return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
  }

  return {
    text: "What would you like to gently explore today?"
  };
}

