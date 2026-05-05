import { BreathingSession } from "../models/BreathingSession.js";

export async function saveSession(req, res, next) {
  try {
    const { technique, rounds, durationSeconds } = req.body;
    const session = await BreathingSession.create({
      userId: req.user._id,
      technique,
      rounds,
      durationSeconds,
      completedAt: new Date()
    });
    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}
