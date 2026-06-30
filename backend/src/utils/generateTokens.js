import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRE,
    algorithm: "HS256", // Explicitly define algorithm
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE,
    algorithm: "HS256", // Explicitly define algorithm
  });
};
