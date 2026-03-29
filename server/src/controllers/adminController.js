import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { getAdminAnalytics } from "../services/analyticsService.js";

export async function getAdminOverview(req, res, next) {
  try {
    const analytics = await getAdminAnalytics();

    return res.json({
      ...analytics,
      securityOverview: {
        jwtEnabled: true,
        passwordHashing: "bcryptjs",
        backupEnabled: env.backupEnabled,
        environment: env.nodeEnv
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("fullName email role isActive streakCount lastJournalDate createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
}

