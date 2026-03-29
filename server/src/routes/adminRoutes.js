import express from "express";
import { body } from "express-validator";
import { getAdminOverview, listUsers, updateUserStatus } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";
import { ROLES } from "../utils/constants.js";

export const adminRouter = express.Router();

adminRouter.use(protect, authorize(ROLES.ADMIN));
adminRouter.get("/overview", getAdminOverview);
adminRouter.get("/users", listUsers);
adminRouter.patch(
  "/users/:id/status",
  [body("isActive").isBoolean().toBoolean().withMessage("A boolean account status is required.")],
  handleValidation,
  updateUserStatus
);
