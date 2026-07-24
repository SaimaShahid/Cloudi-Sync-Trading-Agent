import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters'),
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];