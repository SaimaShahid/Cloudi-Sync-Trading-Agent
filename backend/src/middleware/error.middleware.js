import { logger } from '../config/logger.js';

export const errorMiddleware = (error, request, response, next) => {
  void request;
  void next;

  const statusCode = error.statusCode ?? 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  logger.error(
    {
      error,
      path: request.originalUrl,
      method: request.method,
    },
    'Request failed',
  );

  return response.status(statusCode).json({
    success: false,
    message,
    error: {
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      details: error.details ?? undefined,
    },
  });
};