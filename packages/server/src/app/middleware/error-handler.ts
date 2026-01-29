import config from "@/config";
import { DatabaseError } from "@/db/utils/errors";
import type { NextFunction, Request, Response } from "express";

/**
 * Custom app error class with HTTP status code
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common HTTP error constructors
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalServerError";
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    stack?: string;
  };
}

/**
 * Centralized error handling middleware
 *
 * Catches all errors thrown in route handlers and converts them to appropriate HTTP response
 * Logs errors and includes stack traces in development mode
 *
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandler(
  err: Error | AppError | DatabaseError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof DatabaseError) {
    statusCode = 500;
    message = config.envMode.isDev ? err.message : "Database error occurred";

    if (err.name === "NotFoundError") {
      statusCode = 404;
      message = err.message;
    }
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else {
    message = config.envMode.isDev ? err.message : "Internal Server Error";
  }

  if (statusCode >= 500 || !isOperational) {
    logger.error("Error Handler:", {
      message: err.message,
      statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn("Client Error:", {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      ...(config.envMode.isDev && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found error handler for undefined routes
 * Should be registered after all other routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
}
