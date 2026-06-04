import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";

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
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.userId).select(
      "-password -refreshTokens",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DISABLED",
        message: "Account disabled",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
