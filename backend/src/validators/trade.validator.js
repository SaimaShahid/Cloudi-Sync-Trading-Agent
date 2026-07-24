import { body } from 'express-validator';

import { ORDER_TYPES, ORDER_TYPE_VALUES, TIME_IN_FORCE_VALUES, TRADE_SIDE_VALUES } from '../utils/trade.js';

export const manualTradeOrderValidator = [
  body('symbol')
    .trim()
    .notEmpty()
    .withMessage('Symbol is required')
    .matches(/^[A-Za-z0-9_-]{2,20}$/)
    .withMessage('Symbol must be 2 to 20 characters and contain only letters, numbers, underscore, or hyphen'),
  body('side')
    .notEmpty()
    .withMessage('Side is required')
    .isIn(TRADE_SIDE_VALUES)
    .withMessage(`Side must be one of: ${TRADE_SIDE_VALUES.join(', ')}`),
  body('orderType')
    .notEmpty()
    .withMessage('Order type is required')
    .isIn(ORDER_TYPE_VALUES)
    .withMessage(`Order type must be one of: ${ORDER_TYPE_VALUES.join(', ')}`),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be greater than 0'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0 when provided'),
  body('stopPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Stop price must be greater than 0 when provided'),
  body('timeInForce')
    .optional()
    .isIn(TIME_IN_FORCE_VALUES)
    .withMessage(`Time in force must be one of: ${TIME_IN_FORCE_VALUES.join(', ')}`),
  body('note').optional().isString().withMessage('Note must be a string').isLength({ max: 300 }).withMessage('Note must not exceed 300 characters'),
  body().custom((value) => {
    const supportedFields = ['symbol', 'side', 'orderType', 'quantity', 'price', 'stopPrice', 'timeInForce', 'note'];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Request body must be an object');
    }

    const invalidFields = Object.keys(value).filter((field) => !supportedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Unsupported fields: ${invalidFields.join(', ')}`);
    }

    if (value.orderType === ORDER_TYPES.LIMIT && value.price === undefined) {
      throw new Error('Price is required for limit orders');
    }

    if (value.orderType === ORDER_TYPES.STOP_LIMIT) {
      if (value.price === undefined) {
        throw new Error('Price is required for stop-limit orders');
      }

      if (value.stopPrice === undefined) {
        throw new Error('Stop price is required for stop-limit orders');
      }
    }

    return true;
  }),
];