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
  PORT: process.env.PORT || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URI: process.env.MONGO_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || "15m",

  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "200", 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "20", 10),
};

export default env;
