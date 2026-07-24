import { body, param, query } from 'express-validator';

import { NOTIFICATION_TYPE_VALUES } from '../utils/notification.js';

export const listNotificationsValidator = [
  query('page').optional().isInt({ min: 1, max: 100000 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('onlyUnread').optional().isIn(['true', 'false']).withMessage('onlyUnread must be true or false'),
];

export const notificationIdValidator = [
  param('notificationId').isMongoId().withMessage('Notification id must be a valid MongoDB id'),
];

export const createNotificationValidator = [
  body('userId').isMongoId().withMessage('User id must be a valid MongoDB id'),
  body('type')
    .optional()
    .isIn(NOTIFICATION_TYPE_VALUES)
    .withMessage(`Type must be one of: ${NOTIFICATION_TYPE_VALUES.join(', ')}`),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Title must be between 2 and 120 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 2, max: 1000 })
    .withMessage('Message must be between 2 and 1000 characters'),
  body('data').optional().isObject().withMessage('Data must be an object when provided'),
];