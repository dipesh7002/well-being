import express from "express";
import { body } from "express-validator";
import { getCurrentUser, login, logout, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
  ],
  handleValidation,
  register
);

authRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  handleValidation,
  login
);

authRouter.get("/me", protect, getCurrentUser);
authRouter.post("/logout", protect, logout);

