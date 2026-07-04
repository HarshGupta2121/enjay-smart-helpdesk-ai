import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendError } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn({ msg: err.message, stack: err.stack, path: req.path });
    return sendError(res, err.statusCode, err.message);
  }

  // Handle unexpected errors
  logger.error({ msg: 'Unhandled Exception', err, path: req.path });

  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal Server Error';

  return sendError(res, statusCode, message);
};