import { Notification } from '../models/notification.model.js';

export const createNotification = async ({ userId, type, title, message, data }) =>
  Notification.create({
    userId,
    type,
    title,
    message,
    data: data ?? null,
  });

export const listNotificationsByUserId = async (userId, options = {}) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const onlyUnread = options.onlyUnread ?? false;

  const filter = { userId };

  if (onlyUnread) {
    filter.readAt = null;
  }

  const query = Notification.find(filter).sort({ createdAt: -1 });

  query.skip((page - 1) * limit).limit(limit);

  return query.exec();
};

export const countUnreadNotificationsByUserId = async (userId) => Notification.countDocuments({ userId, readAt: null }).exec();

export const markNotificationAsRead = async (userId, notificationId) =>
  Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId,
    },
    {
      $set: {
        readAt: new Date(),
      },
    },
    {
      new: true,
    },
  ).exec();

export const markAllNotificationsAsRead = async (userId) =>
  Notification.updateMany(
    {
      userId,
      readAt: null,
    },
    {
      $set: {
        readAt: new Date(),
      },
    },
  ).exec();