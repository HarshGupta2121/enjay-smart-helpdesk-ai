import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to pass unhandled promise rejections to the global error handler
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };