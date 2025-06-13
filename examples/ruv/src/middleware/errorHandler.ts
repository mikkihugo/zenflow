import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      status,
      error: err.message,
      stack: err.stack,
    });
  } else {
    res.status(statusCode).json({
      success: false,
      status,
      error: statusCode === 500 ? 'Internal server error' : err.message,
    });
  }
};