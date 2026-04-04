import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { analyticsRouter } from "./routes/analyticsRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { helperRouter } from "./routes/helperRoutes.js";
import { journalRouter } from "./routes/journalRoutes.js";
import { settingsRouter } from "./routes/settingsRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again in a few minutes."
  }
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/health", healthRouter);
app.use("/api/journals", journalRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/helper", helperRouter);

app.use(notFoundHandler);
app.use(errorHandler);
