import jwt from "jsonwebtoken";
import env from "../config/envConfig.js";
import User from "../models/User.js";
import {
  AUTH_EVENTS,
  recordAuthEvent,
} from "../services/auth/authMonitoringService.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      await recordAuthEvent(req, {
        eventType: AUTH_EVENTS.AUTH_FAILURE,
        reason: "ACCESS_TOKEN_MISSING",
      });

      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_MISSING",
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.userId).select(
      "-password -refreshTokens",
    );

    if (!user) {
      await recordAuthEvent(req, {
        user: decoded.userId,
        eventType: AUTH_EVENTS.AUTH_FAILURE,
        reason: "ACCESS_USER_NOT_FOUND",
      });

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isDisabled) {
      await recordAuthEvent(req, {
        user: user._id,
        eventType: AUTH_EVENTS.SESSION_EXPIRED,
        reason: "ACCOUNT_DISABLED",
      });

      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DISABLED",
        message: "Account disabled",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    await recordAuthEvent(req, {
      eventType:
        error.name === "TokenExpiredError"
          ? AUTH_EVENTS.SESSION_EXPIRED
          : AUTH_EVENTS.AUTH_FAILURE,
      reason: error.name || "ACCESS_TOKEN_INVALID",
    });

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
