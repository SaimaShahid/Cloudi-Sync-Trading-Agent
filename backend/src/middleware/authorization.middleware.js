import { AppError } from '../utils/app-error.js';
import { hasAnyRole } from '../utils/roles.js';

export const requireRole = (...allowedRoles) => (request, response, next) => {
  void response;

  if (!request.user) {
    return next(new AppError('Authentication is required before authorization', 401, 'AUTH_REQUIRED'));
  }

  if (!hasAnyRole(request.user.role, allowedRoles)) {
    return next(new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN'));
  }

  return next();
};