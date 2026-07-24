import {
  createUserNotification,
  getNotifications,
  getUnreadNotificationCount,
  readAllNotifications,
  readNotification,
} from '../services/notification.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const listNotifications = asyncHandler(async (request, response) => {
  const data = await getNotifications(request.user, {
    page: request.query.page ? Number(request.query.page) : undefined,
    limit: request.query.limit ? Number(request.query.limit) : undefined,
    onlyUnread: request.query.onlyUnread === 'true',
  });

  return sendSuccess(response, {
    message: 'Notifications fetched successfully',
    data,
  });
});

export const getUnreadCount = asyncHandler(async (request, response) => {
  const data = await getUnreadNotificationCount(request.user);

  return sendSuccess(response, {
    message: 'Unread notification count fetched successfully',
    data,
  });
});

export const markNotificationRead = asyncHandler(async (request, response) => {
  const data = await readNotification(request.user, request.params.notificationId);

  return sendSuccess(response, {
    message: 'Notification marked as read',
    data,
  });
});

export const markAllNotificationsRead = asyncHandler(async (request, response) => {
  const data = await readAllNotifications(request.user);

  return sendSuccess(response, {
    message: 'All notifications marked as read',
    data,
  });
});

export const createNotificationForUser = asyncHandler(async (request, response) => {
  const data = await createUserNotification(request.user, request.body);

  return sendSuccess(response, {
    statusCode: 201,
    message: 'Notification created successfully',
    data,
  });
});