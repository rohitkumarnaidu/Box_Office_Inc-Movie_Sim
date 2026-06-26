import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const formattedErrors = (err.issues || []).map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }

  console.error("Server Error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
