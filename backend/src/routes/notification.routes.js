import { Router } from 'express';

import {
  createNotificationForUser,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/authorization.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createNotificationValidator,
  listNotificationsValidator,
  notificationIdValidator,
} from '../validators/notification.validator.js';
import { USER_ROLES } from '../utils/roles.js';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, listNotificationsValidator, validateRequest, listNotifications);
notificationRouter.get('/unread-count', requireAuth, getUnreadCount);
notificationRouter.patch('/read-all', requireAuth, markAllNotificationsRead);
notificationRouter.patch('/:notificationId/read', requireAuth, notificationIdValidator, validateRequest, markNotificationRead);
notificationRouter.post(
  '/',
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  createNotificationValidator,
  validateRequest,
  createNotificationForUser,
);