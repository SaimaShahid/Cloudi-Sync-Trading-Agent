import {
  countUnreadNotificationsByUserId,
  createNotification,
  listNotificationsByUserId,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../repositories/notification.repository.js';
import { AppError } from '../utils/app-error.js';
import { emitNotificationUpdate } from '../sockets/socket-broadcaster.js';

const toSafeNotification = (notification) => ({
  id: notification.id,
  userId: String(notification.userId),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  data: notification.data,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const buildListOptions = (query) => ({
  page: query.page ?? 1,
  limit: query.limit ?? 20,
  onlyUnread: query.onlyUnread ?? false,
});

export const getNotifications = async (user, query = {}) => {
  const options = buildListOptions(query);
  const notifications = await listNotificationsByUserId(user.id, options);
  const unreadCount = await countUnreadNotificationsByUserId(user.id);

  return {
    items: notifications.map(toSafeNotification),
    pagination: {
      page: options.page,
      limit: options.limit,
    },
    unreadCount,
  };
};

export const getUnreadNotificationCount = async (user) => ({
  unreadCount: await countUnreadNotificationsByUserId(user.id),
});

export const readNotification = async (user, notificationId) => {
  const notification = await markNotificationAsRead(user.id, notificationId);

  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  const payload = toSafeNotification(notification);

  emitNotificationUpdate(user.id, {
    channel: 'read',
    payload,
  });

  return payload;
};

export const readAllNotifications = async (user) => {
  const result = await markAllNotificationsAsRead(user.id);
  const unreadCount = await countUnreadNotificationsByUserId(user.id);

  const payload = {
    modifiedCount: result.modifiedCount ?? 0,
    unreadCount,
  };

  emitNotificationUpdate(user.id, {
    channel: 'read_all',
    payload,
  });

  return payload;
};

export const createUserNotification = async (actorUser, payload) => {
  const notification = await createNotification({
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    data: payload.data,
  });

  const safeNotification = toSafeNotification(notification);

  emitNotificationUpdate(payload.userId, {
    channel: 'new',
    payload: safeNotification,
  });

  return {
    notification: safeNotification,
    createdBy: {
      id: actorUser.id,
      email: actorUser.email,
      role: actorUser.role,
    },
  };
};