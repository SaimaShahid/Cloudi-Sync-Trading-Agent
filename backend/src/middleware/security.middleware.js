import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export const enforceHttpsInProduction = (request, response, next) => {
  void response;

  if (!env.enforceHttpsInProduction || env.nodeEnv !== 'production') {
    return next();
  }

  const forwardedProto = request.headers['x-forwarded-proto'];
  const isSecure = request.secure || forwardedProto === 'https';

  if (!isSecure) {
    return next(new AppError('HTTPS is required in production', 400, 'HTTPS_REQUIRED'));
  }

  return next();
};