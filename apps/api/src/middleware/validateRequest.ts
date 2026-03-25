import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

/**
 * validateRequest — global middleware using Zod schemas from @99tech/shared.
 * Validates the specified part of the request and returns 422 on failure.
 */
export function validateRequest(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      res.status(422).json({
        message: 'Validation failed',
        errors: formatZodErrors(result.error),
      });
      return;
    }

    // Replace the raw input with the parsed (coerced) data
    req[part] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError) {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}
