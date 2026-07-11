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
  const meta = { path: req.path, method: req.method };

  if (statusCode >= 500) {
    logger.error(err.message, { ...meta, stack: err.stack });
  } else {
    logger.warn(err.message, meta);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
};

export default errorHandler;
