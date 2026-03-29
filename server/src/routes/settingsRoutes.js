import express from "express";
import { body } from "express-validator";
import { getSettings, listHelpers, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";

export const settingsRouter = express.Router();

settingsRouter.use(protect);
settingsRouter.get("/", getSettings);
settingsRouter.get("/helpers", listHelpers);
settingsRouter.put(
  "/",
  [
    body("fullName").optional().trim().notEmpty(),
    body("themePreference").optional().isIn(["sunrise", "soft-peach", "rose-glow"]),
    body("reminderEnabled").optional().isBoolean().toBoolean(),
    body("reminderTime").optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body("allowHelperSharing").optional().isBoolean().toBoolean(),
    body("shareMoodSummaries").optional().isBoolean().toBoolean()
  ],
  handleValidation,
  updateSettings
);
