/**
 * @fileoverview Validation Middleware Factory using Zod
 *
 * Validates request body, query, and params against Zod schemas.
 * Passes ZodError to the global error handler for structured formatting.
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
      if (schemas.headers) {
        req.headers = await schemas.headers.parseAsync(req.headers);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;
