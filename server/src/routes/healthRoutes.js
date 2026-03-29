import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "wellbeing-journal-api",
    timestamp: new Date().toISOString()
  });
});

