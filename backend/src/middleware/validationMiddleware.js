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
      if (error instanceof ZodError) {
        const validationIssues = error.issues || error.errors || [];
        
        const errors = validationIssues.map((e) => ({
          field: e.path.join(".") || e.path[0] || "",
          message: e.message,
        }));
        
        // FIXED: Removed the extra 'message' property so it perfectly matches the test
        return res.status(400).json({
          success: false,
          errors,
        });
      }
      
      next(error);
    }
  };
};

export default validate;
