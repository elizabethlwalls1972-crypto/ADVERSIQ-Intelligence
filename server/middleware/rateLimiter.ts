// Per-User Rate Limiting (in addition to IP-based)
// Tracks request counts per authenticated user ID.

interface UserRateLimit {
  count: number;
  resetAt: number;
}

const userLimits = new Map<string, UserRateLimit>();

setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of userLimits.entries()) {
    if (now > limit.resetAt) {
      userLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string | null;
}

export function userRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Rate limit exceeded. Please try again later.',
    keyGenerator,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    let key: string | null = null;
    if (keyGenerator) {
      key = keyGenerator(req);
    }
    if (!key) {
      key = req.user?.id || req.ip || 'unknown';
    }

    const now = Date.now();
    let limit = userLimits.get(key);

    if (!limit || now > limit.resetAt) {
      limit = { count: 0, resetAt: now + windowMs };
      userLimits.set(key, limit);
    }

    limit.count++;

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - limit.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(limit.resetAt / 1000));

    if (limit.count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((limit.resetAt - now) / 1000),
      });
      return;
    }

    next();
  };
}

export const aiUserLimiter = userRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'AI rate limit exceeded. Maximum 15 requests per minute.',
});

export const reportUserLimiter = userRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Report rate limit exceeded. Maximum 10 operations per minute.',
});

export const authUserLimiter = userRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  keyGenerator: (req) => req.body?.email || req.ip || 'unknown',
});
