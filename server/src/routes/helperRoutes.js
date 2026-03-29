import express from "express";
import { body } from "express-validator";
import { addHelperFeedback, getSharedEntries } from "../controllers/helperController.js";
import { authorize, protect } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";
import { ROLES } from "../utils/constants.js";

export const helperRouter = express.Router();

helperRouter.use(protect, authorize(ROLES.HELPER));
helperRouter.get("/shared-entries", getSharedEntries);
helperRouter.post(
  "/shared-access/:id/feedback",
  [body("message").trim().notEmpty().withMessage("Feedback message is required.")],
  handleValidation,
  addHelperFeedback
);

