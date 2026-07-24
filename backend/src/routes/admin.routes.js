import { Router } from 'express';

import { getAdminAccessCheck, getTradingEngineHealth } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/authorization.middleware.js';
import { USER_ROLES } from '../utils/roles.js';

export const adminRouter = Router();

adminRouter.get('/access-check', requireAuth, requireRole(USER_ROLES.ADMIN), getAdminAccessCheck);
adminRouter.get('/trading-engine/health', requireAuth, requireRole(USER_ROLES.ADMIN), getTradingEngineHealth);