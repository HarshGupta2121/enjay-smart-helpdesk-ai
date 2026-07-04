import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract the first meaningful error message
        const message = error.issues[0]?.message || 'Validation failed';
        next(new BadRequestError(message));
      } else {
        next(error);
      }
    }
  };