// Request Validation Middleware
// Lightweight validation without external dependencies.
// For complex schemas, install zod and replace these helpers.

import { Request, Response, NextFunction } from 'express';

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: unknown[];
  custom?: (value: unknown) => string | null;
}

interface ValidationError {
  field: string;
  message: string;
}

function validate(body: Record<string, unknown>, rules: ValidationRule[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = body[rule.field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: rule.field, message: `${rule.field} is required.` });
      continue;
    }

    if (!rule.required && (value === undefined || value === null)) continue;

    if (rule.type) {
      let typeOk = true;
      switch (rule.type) {
        case 'string':
          typeOk = typeof value === 'string';
          break;
        case 'number':
          typeOk = typeof value === 'number' && !isNaN(value);
          break;
        case 'boolean':
          typeOk = typeof value === 'boolean';
          break;
        case 'array':
          typeOk = Array.isArray(value);
          break;
        case 'object':
          typeOk = typeof value === 'object' && !Array.isArray(value);
          break;
        case 'email':
          typeOk = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          break;
      }
      if (!typeOk) {
        errors.push({ field: rule.field, message: `${rule.field} must be a valid ${rule.type}.` });
        continue;
      }
    }

    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.minLength} characters.` });
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.maxLength} characters.` });
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({ field: rule.field, message: `${rule.field} has invalid format.` });
      }
    }

    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}.` });
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.max}.` });
      }
    }

    if (Array.isArray(value)) {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({ field: rule.field, message: `${rule.field} must have at least ${rule.minLength} items.` });
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({ field: rule.field, message: `${rule.field} must have at most ${rule.maxLength} items.` });
      }
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({ field: rule.field, message: `${rule.field} must be one of: ${rule.allowedValues.join(', ')}.` });
    }

    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push({ field: rule.field, message: customError });
      }
    }
  }

  return errors;
}

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Request body is required and must be JSON.' });
      return;
    }

    const errors = validate(req.body as Record<string, unknown>, rules);
    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed.', details: errors });
      return;
    }

    next();
  };
}

export function sanitizeString(value: string): string {
  return value
    .replace(/\0/g, '')
    .replace(/<script[\s>]/gi, '')
    .trim();
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') return next();

  const sanitize = (obj: Record<string, unknown>): void => {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key] as string);
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sanitize(obj[key] as Record<string, unknown>);
      }
    }
  };

  sanitize(req.body as Record<string, unknown>);
  next();
}

export const authValidation = {
  register: [
    { field: 'email', required: true, type: 'email' as const, maxLength: 254 },
    { field: 'password', required: true, type: 'string' as const, minLength: 8, maxLength: 128 },
    { field: 'name', required: false, type: 'string' as const, maxLength: 100 },
  ],
  login: [
    { field: 'email', required: true, type: 'email' as const },
    { field: 'password', required: true, type: 'string' as const, maxLength: 128 },
  ],
  changePassword: [
    { field: 'currentPassword', required: true, type: 'string' as const, maxLength: 128 },
    { field: 'newPassword', required: true, type: 'string' as const, minLength: 8, maxLength: 128 },
  ],
};

export const reportValidation = {
  create: [
    { field: 'organizationName', required: true, type: 'string' as const, minLength: 1, maxLength: 200 },
    { field: 'country', required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
    { field: 'industry', required: false, type: 'array' as const },
    { field: 'problemStatement', required: false, type: 'string' as const, maxLength: 5000 },
  ],
  update: [
    { field: 'id', required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
    { field: 'status', required: false, allowedValues: ['draft', 'generating', 'complete', 'abandoned'] },
  ],
};

export const aiValidation = {
  chat: [
    { field: 'message', required: true, type: 'string' as const, minLength: 1, maxLength: 15000 },
    { field: 'systemInstruction', required: false, type: 'string' as const, maxLength: 5000 },
  ],
  insights: [
    { field: 'organizationName', required: true, type: 'string' as const, minLength: 1, maxLength: 200 },
    { field: 'country', required: false, type: 'string' as const, maxLength: 100 },
  ],
  monteCarlo: [
    { field: 'inputs', required: true, type: 'array' as const, minLength: 1, maxLength: 20 },
    { field: 'trials', required: false, type: 'number' as const, min: 10, max: 10000 },
  ],
};

export const learningValidation = {
  outcome: [
    { field: 'reportId', required: true, type: 'string' as const, minLength: 1 },
    { field: 'actualStatus', required: true, allowedValues: ['complete', 'abandoned', 'stalled'] },
    { field: 'userRating', required: false, type: 'number' as const, min: 1, max: 5 },
    { field: 'predictedSpi', required: false, type: 'number' as const, min: 0, max: 100 },
    { field: 'predictedRroi', required: false, type: 'number' as const, min: 0, max: 100 },
  ],
};
