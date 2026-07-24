import { AppError } from '../utils/app-error.js';

export const notFoundMiddleware = (request, response, next) => {
  void response;

  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
};