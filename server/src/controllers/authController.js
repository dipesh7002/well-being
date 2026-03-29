import jwt from "jsonwebtoken";
import { matchedData } from "express-validator";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

function buildAuthResponse(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    themePreference: user.themePreference,
    reminderEnabled: user.reminderEnabled,
    reminderTime: user.reminderTime,
    streakCount: user.streakCount,
    badges: user.badges,
    consentSettings: user.consentSettings,
    isActive: user.isActive
  };
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = matchedData(req);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      fullName,
      email,
      passwordHash
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: buildAuthResponse(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = matchedData(req);
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: buildAuthResponse(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res) {
  return res.json({
    user: buildAuthResponse(req.user)
  });
}

export async function logout(req, res) {
  return res.json({ message: "Logged out successfully." });
}

