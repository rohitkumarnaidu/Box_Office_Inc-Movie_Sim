import crypto from "crypto";

import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";

import { hashPassword, comparePassword } from "../services/auth/authService.js";

import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import env from "../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: THIRTY_DAYS_IN_MS,
  path: "/api/auth",
});

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  const cookieOptions = getRefreshCookieOptions();
  delete cookieOptions.maxAge;

  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
};

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  delete userObject.refreshTokens;
  return userObject;
};

const persistRefreshToken = async (user, refreshToken) => {
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_IN_MS);

  user.refreshTokens = [
    ...(user.refreshTokens || []).filter(
      (session) => session.expiresAt && session.expiresAt > new Date(),
    ),
    {
      tokenHash: hashRefreshToken(refreshToken),
      createdAt: new Date(),
      expiresAt,
    },
  ];

  await user.save();
};

const issueAuthTokens = async (res, user) => {
  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await persistRefreshToken(user, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  return token;
};

export const register = async (req, res) => {
  try {
    const { username, email, password, studioName } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const studio = await Studio.create({
      owner: user._id,
      name: studioName || `${username} Studios`,
    });

    await GameState.create({
      user: user._id,
    });

    user.studio = studio._id;

    const token = await issueAuthTokens(res, user);

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
      studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = await issueAuthTokens(res, user);
    const populatedUser = await User.findById(user._id)
      .select("-password -refreshTokens")
      .populate("studio");

    res.status(200).json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const tokenHash = hashRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh session",
      });
    }

    const now = new Date();
    const matchingSession = user.refreshTokens?.find(
      (session) => session.tokenHash === tokenHash && session.expiresAt > now,
    );

    if (!matchingSession) {
      user.refreshTokens = (user.refreshTokens || []).filter(
        (session) => session.expiresAt && session.expiresAt > now,
      );
      await user.save();
      clearRefreshTokenCookie(res);

      return res.status(401).json({
        success: false,
        message: "Invalid refresh session",
      });
    }

    user.refreshTokens = (user.refreshTokens || []).filter(
      (session) => session.tokenHash !== tokenHash && session.expiresAt > now,
    );

    const token = await issueAuthTokens(res, user);
    const refreshedUser = await User.findById(user._id)
      .select("-password -refreshTokens")
      .populate("studio");

    res.status(200).json({
      success: true,
      token,
      user: refreshedUser,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await User.updateOne(
        { "refreshTokens.tokenHash": tokenHash },
        { $pull: { refreshTokens: { tokenHash } } },
      );
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -refreshTokens")
      .populate("studio");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
