import express from "express";
import { body } from "express-validator";
import {
  createEntry,
  deleteEntry,
  getEntry,
  listEntries,
  shareEntryWithHelper,
  updateEntry
} from "../controllers/journalController.js";
import { protect } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";

export const journalRouter = express.Router();

journalRouter.use(protect);

journalRouter.get("/", listEntries);
journalRouter.get("/:id", getEntry);
journalRouter.post(
  "/",
  [
    body("entryDate").optional().isISO8601().withMessage("Enter a valid entry date."),
    body("text").trim().notEmpty().withMessage("Journal text is required."),
    body("manualMood").trim().notEmpty().withMessage("Please choose a mood."),
    body("finalMood").optional().trim().notEmpty(),
    body("status").optional().isIn(["draft", "final"]),
    body("promptUsed").optional().trim()
  ],
  handleValidation,
  createEntry
);
journalRouter.put(
  "/:id",
  [
    body("entryDate").optional().isISO8601().withMessage("Enter a valid entry date."),
    body("text").trim().notEmpty().withMessage("Journal text is required."),
    body("manualMood").trim().notEmpty().withMessage("Please choose a mood."),
    body("finalMood").optional().trim().notEmpty(),
    body("status").optional().isIn(["draft", "final"]),
    body("promptUsed").optional().trim()
  ],
  handleValidation,
  updateEntry
);
journalRouter.delete("/:id", deleteEntry);
journalRouter.post(
  "/:id/share",
  [body("helperId").isMongoId().withMessage("Select a valid helper account.")],
  handleValidation,
  shareEntryWithHelper
);
