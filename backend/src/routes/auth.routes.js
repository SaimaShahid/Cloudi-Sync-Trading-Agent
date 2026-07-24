import { Router } from 'express';

import { getCurrentUser, login, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/auth-rate-limit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, registerValidator, validateRequest, register);
authRouter.post('/login', authRateLimiter, loginValidator, validateRequest, login);
authRouter.get('/me', requireAuth, getCurrentUser);