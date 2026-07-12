import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `CRITICAL: Missing required environment variables: ${missingEnvVars.join(", ")}. Check your .env file.`,
  );
}

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URI: process.env.MONGO_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || "15m",

  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",

  CLIENT_URL: process.env.CLIENT_URL,

  BANKRUPTCY_THRESHOLD_WEEKS: Math.max(1, parseInt(process.env.BANKRUPTCY_THRESHOLD_WEEKS, 10) || 4),

  MAX_ACTIVE_LOANS: Math.max(1, parseInt(process.env.MAX_ACTIVE_LOANS, 10) || 3),

  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "combined" : "dev"),

  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 30000,
};

export default env;
