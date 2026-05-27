// Structured Error Handling
// Replaces catch-all console.error with typed errors and proper responses.

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: { field: string; message: string }[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds = 60) {
    super('Rate limit exceeded', 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: string) {
    super(`External service error: ${service}${originalError ? ` — ${originalError}` : ''}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

import { randomUUID } from 'crypto';

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.headers['x-request-id'] = req.headers['x-request-id'] as string || randomUUID();
  next();
}

export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] || 'unknown';
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError && err.isOperational) {
    console.warn(`[${requestId}] ${err.code}: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    console.error(`[${requestId}] UNHANDLED ERROR:`, {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: isProduction ? '[redacted]' : req.body,
    });
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';

  const response: Record<string, unknown> = {
    error: err instanceof AppError ? err.message : 'Internal server error',
    code,
    requestId,
  };

  if (err instanceof ValidationError && err.fields) {
    response.details = err.fields;
  }

  if (!isProduction && !(err instanceof AppError)) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
