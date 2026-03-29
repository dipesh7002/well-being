import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/summary", protect, getDashboardSummary);

