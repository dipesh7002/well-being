import { matchedData } from "express-validator";
import { User } from "../models/User.js";
import { ROLES } from "../utils/constants.js";

export async function getSettings(req, res) {
  return res.json({
    settings: {
      fullName: req.user.fullName,
      email: req.user.email,
      themePreference: req.user.themePreference,
      reminderEnabled: req.user.reminderEnabled,
      reminderTime: req.user.reminderTime,
      consentSettings: req.user.consentSettings
    }
  });
}

export async function updateSettings(req, res, next) {
  try {
    const data = matchedData(req, { locations: ["body"] });
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (data.fullName) user.fullName = data.fullName;
    if (data.themePreference) user.themePreference = data.themePreference;
    if (typeof data.reminderEnabled === "boolean") user.reminderEnabled = data.reminderEnabled;
    if (data.reminderTime) user.reminderTime = data.reminderTime;
    if (data.allowHelperSharing !== undefined) {
      user.consentSettings.allowHelperSharing = data.allowHelperSharing;
    }
    if (data.shareMoodSummaries !== undefined) {
      user.consentSettings.shareMoodSummaries = data.shareMoodSummaries;
    }

    await user.save();

    return res.json({
      message: "Settings updated successfully.",
      settings: {
        fullName: user.fullName,
        email: user.email,
        themePreference: user.themePreference,
        reminderEnabled: user.reminderEnabled,
        reminderTime: user.reminderTime,
        consentSettings: user.consentSettings
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listHelpers(req, res, next) {
  try {
    const helpers = await User.find({
      role: ROLES.HELPER,
      isActive: true
    })
      .select("fullName email")
      .sort({ fullName: 1 })
      .lean();

    return res.json({ helpers });
  } catch (error) {
    next(error);
  }
}
