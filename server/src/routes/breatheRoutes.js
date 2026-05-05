import express from "express";
import { body } from "express-validator";
import { saveSession } from "../controllers/breatheController.js";
import { protect } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";

export const breatheRouter = express.Router();

breatheRouter.post(
  "/sessions",
  protect,
  [
    body("technique").isIn(["478", "box", "calm"]),
    body("rounds").isInt({ min: 1, max: 20 }),
    body("durationSeconds").isInt({ min: 1 })
  ],
  handleValidation,
  saveSession
);
