import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

export const authRateLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  limit: env.authRateLimitMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});