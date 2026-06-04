import User from "../models/User.js";
import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";

import { hashPassword, comparePassword } from "../services/auth/authService.js";

import {
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
  clearRefreshTokenCookie,
  createAuthTokenBundle,
  hashRefreshToken,
  setRefreshTokenCookie,
  verifyRefreshToken,
} from "../services/auth/tokenService.js";

const isJwtRefreshError = (error) =>
  error.name === "TokenExpiredError" || error.name === "JsonWebTokenError";

const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await User.updateOne(
    { "refreshTokens.tokenHash": tokenHash },
    { $pull: { refreshTokens: { tokenHash } } },
  );
};

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  delete userObject.refreshTokens;
  return userObject;
};

const persistRefreshToken = async (user, refreshToken) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

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
  const tokenBundle = createAuthTokenBundle(user._id);

  await persistRefreshToken(user, tokenBundle.refreshToken);
  setRefreshTokenCookie(res, tokenBundle.refreshToken);

  return tokenBundle;
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

    const tokenBundle = await issueAuthTokens(res, user);

    res.status(201).json({
      success: true,
      token: tokenBundle.token,
      accessTokenExpiresAt: tokenBundle.accessTokenExpiresAt,
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

    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DISABLED",
        message: "Account disabled",
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const tokenBundle = await issueAuthTokens(res, user);
    const populatedUser = await User.findById(user._id)
      .select("-password -refreshTokens")
      .populate("studio");

    res.status(200).json({
      success: true,
      token: tokenBundle.token,
      accessTokenExpiresAt: tokenBundle.accessTokenExpiresAt,
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

    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh session",
      });
    }

    if (user.isDisabled) {
      await revokeRefreshToken(refreshToken);
      clearRefreshTokenCookie(res);

      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DISABLED",
        message: "Account disabled",
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

    const tokenBundle = await issueAuthTokens(res, user);
    const refreshedUser = await User.findById(user._id)
      .select("-password -refreshTokens")
      .populate("studio");

    res.status(200).json({
      success: true,
      token: tokenBundle.token,
      accessTokenExpiresAt: tokenBundle.accessTokenExpiresAt,
      user: refreshedUser,
    });
  } catch (error) {
    if (isJwtRefreshError(error)) {
      clearRefreshTokenCookie(res);

      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_INVALID",
        message: "Invalid refresh token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to refresh session",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    await revokeRefreshToken(refreshToken);

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
