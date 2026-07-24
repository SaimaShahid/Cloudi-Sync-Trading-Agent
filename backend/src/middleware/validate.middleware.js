import { validationResult } from 'express-validator';

import { AppError } from '../utils/app-error.js';

export const validateRequest = (request, response, next) => {
  void response;

  const errors = validationResult(request);

  if (errors.isEmpty()) {
    return next();
  }

  return next(
    new AppError('Validation failed', 422, 'VALIDATION_ERROR', {
      fields: errors.array(),
    }),
  );
};