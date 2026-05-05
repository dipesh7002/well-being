import express from "express";
import { getBreathingAnalyticsHandler, getMoodAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

export const analyticsRouter = express.Router();

analyticsRouter.get("/moods", protect, getMoodAnalytics);
analyticsRouter.get("/breathing", protect, getBreathingAnalyticsHandler);

