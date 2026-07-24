import { body, param } from 'express-validator';

import { USER_ROLE_VALUES } from '../utils/roles.js';

export const updateProfileValidator = [
  body().custom((value) => {
    const allowedFields = ['name', 'email'];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Request body must be an object');
    }

    const providedFields = Object.keys(value);

    if (providedFields.length === 0) {
      throw new Error('At least one field must be provided');
    }

    const invalidFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Unsupported fields: ${invalidFields.join(', ')}`);
    }

    return true;
  }),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email').optional().trim().isEmail().withMessage('Email must be valid').normalizeEmail(),
];

export const updateUserRoleValidator = [
  param('userId').isMongoId().withMessage('User id must be a valid MongoDB id'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(USER_ROLE_VALUES)
    .withMessage(`Role must be one of: ${USER_ROLE_VALUES.join(', ')}`),
];