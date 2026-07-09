import { ZodError } from "zod";

/**
 * @fileoverview Validation Middleware Factory using Zod
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      // If Zod catches a validation error, immediately return the exact shape the tests expect
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join(".") || e.path[0] || "",
          message: e.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors,
        });
      }
      
      // If it's a different kind of server error, pass it along
      next(error);
    }
  };
};

export default validate;
