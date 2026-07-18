import { ZodError } from "zod";
import mongoose from "mongoose";

const isDev = process.env.NODE_ENV !== "production";

const ERROR_CODES = {
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  RATE_LIMIT: "RATE_LIMIT",
  TIMEOUT: "TIMEOUT",
  INTERNAL: "INTERNAL_ERROR",
};

const formatZodErrors = (err) => {
  const formatted = [];
  for (const issue of err.issues || []) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_root";
    const code = issue.code || "invalid_type";
    formatted.push({
      field: path,
      message: issue.message,
      code,
    });
  }
  return formatted;
};

const handleMongooseError = (err) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.entries(err.errors).map(([field, e]) => ({
      field,
      message: e.message,
      code: e.kind || "validation",
    }));
    return {
      status: 400,
      code: ERROR_CODES.VALIDATION,
      message: "Database validation failed",
      errors,
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      status: 400,
      code: ERROR_CODES.VALIDATION,
      message: `Invalid value for ${err.path}: ${err.value}`,
      errors: [{ field: err.path, message: `Expected ${err.kind}`, code: "cast" }],
    };
  }

  if (err.code === 11000 || err.code === 11001) {
    const field = Object.keys(err.keyValue || {})[0] || "unknown";
    return {
      status: 409,
      code: ERROR_CODES.CONFLICT,
      message: `Duplicate value for ${field}. This ${field} is already in use.`,
      errors: [{ field, message: "Already exists", code: "duplicate" }],
    };
  }

  return null;
};

const handleGenericError = (err) => {
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return {
      status: 401,
      code: ERROR_CODES.UNAUTHORIZED,
      message: err.name === "TokenExpiredError" ? "Session expired. Please log in again." : "Invalid authentication token.",
    };
  }

  if (err.name === "MulterError") {
    return {
      status: 400,
      code: ERROR_CODES.VALIDATION,
      message: `File upload error: ${err.message}`,
    };
  }

  if (err.type === "entity.too.large") {
    return {
      status: 413,
      code: ERROR_CODES.VALIDATION,
      message: "Request body too large.",
    };
  }

  return null;
};

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: ERROR_CODES.VALIDATION,
      message: "Request validation failed",
      errors: formatZodErrors(err),
    });
  }

  const mongooseResponse = handleMongooseError(err);
  if (mongooseResponse) {
    return res.status(mongooseResponse.status).json({
      success: false,
      code: mongooseResponse.code,
      message: mongooseResponse.message,
      errors: mongooseResponse.errors,
    });
  }

  const genericResponse = handleGenericError(err);
  if (genericResponse) {
    return res.status(genericResponse.status).json({
      success: false,
      code: genericResponse.code,
      message: genericResponse.message,
    });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      code: err.code || ERROR_CODES.INTERNAL,
      message: err.message || "An error occurred",
    });
  }

  if (isDev) {
    console.error("[Error]", err.stack || err.message || err);
  }

  return res.status(err.status || 500).json({
    success: false,
    code: ERROR_CODES.INTERNAL,
    message: isDev ? err.message || "Internal Server Error" : "An unexpected error occurred. Please try again.",
    ...(isDev && { stack: err.stack }),
  });
};

export default errorHandler;
