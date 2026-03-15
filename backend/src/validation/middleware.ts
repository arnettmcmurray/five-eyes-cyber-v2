import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/** Validates req.body against schema. Sends 400 with Zod error details on failure. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates req.query against schema.
 * Attaches parsed+coerced values to res.locals.query (req.query is read-only in Express 5).
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    res.locals['query'] = result.data;
    next();
  };
}
