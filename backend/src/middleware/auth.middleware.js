import { getAuthenticatedUser } from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new AppError('Authentication token is required', 401, 'AUTH_TOKEN_REQUIRED');
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Invalid authorization header format', 401, 'AUTH_HEADER_INVALID');
  }

  return token;
};

export const requireAuth = async (request, response, next) => {
  void response;

  try {
    const token = extractBearerToken(request.headers.authorization);
    const decodedToken = verifyAccessToken(token);
    request.user = await getAuthenticatedUser(decodedToken.sub);
    next();
  } catch (error) {
    next(error);
  }
};