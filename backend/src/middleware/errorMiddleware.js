import { ZodError } from "zod";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const formattedErrors = (err.issues || []).map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    
    // FIXED: Removed the extra 'message' property so it strictly matches the test
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] Server Error:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : (err.message || "Internal Server Error"),
  });
};

export default errorHandler;
