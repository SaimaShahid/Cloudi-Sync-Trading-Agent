import { Router } from 'express';

import { listUsers, updateCurrentUserProfile, updateUserRole, viewCurrentUserProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/authorization.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { updateProfileValidator, updateUserRoleValidator } from '../validators/user.validator.js';
import { USER_ROLES } from '../utils/roles.js';

export const userRouter = Router();

userRouter.get('/me', requireAuth, viewCurrentUserProfile);
userRouter.patch('/me', requireAuth, updateProfileValidator, validateRequest, updateCurrentUserProfile);
userRouter.get('/', requireAuth, requireRole(USER_ROLES.ADMIN), listUsers);
userRouter.patch('/:userId/role', requireAuth, requireRole(USER_ROLES.ADMIN), updateUserRoleValidator, validateRequest, updateUserRole);