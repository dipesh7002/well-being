import { getUserAnalytics } from "../services/analyticsService.js";

export async function getMoodAnalytics(req, res, next) {
  try {
    const analytics = await getUserAnalytics(req.user._id);
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
}

