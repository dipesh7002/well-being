import { getBreathingAnalytics, getUserAnalytics } from "../services/analyticsService.js";

export async function getMoodAnalytics(req, res, next) {
  try {
    const analytics = await getUserAnalytics(req.user._id);
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
}

export async function getBreathingAnalyticsHandler(req, res, next) {
  try {
    const analytics = await getBreathingAnalytics(req.user._id);
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
}

