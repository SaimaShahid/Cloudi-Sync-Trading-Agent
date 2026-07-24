import { getAuthenticatedUser } from '../services/auth.service.js';
import { verifyAccessToken } from '../utils/jwt.js';

const getTokenFromAuthPayload = (auth) => {
  if (!auth) {
    return null;
  }

  if (typeof auth.token === 'string' && auth.token.trim().length > 0) {
    return auth.token;
  }

  if (typeof auth.authorization === 'string') {
    const [scheme, token] = auth.authorization.split(' ');

    if (scheme === 'Bearer' && token) {
      return token;
    }
  }

  return null;
};

const getTokenFromHeaders = (headers) => {
  const authorization = headers?.authorization;

  if (!authorization || typeof authorization !== 'string') {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const authenticateSocket = async (socket) => {
  const token = getTokenFromAuthPayload(socket.handshake.auth) ?? getTokenFromHeaders(socket.handshake.headers);

  if (!token) {
    throw new Error('Socket authentication token is required');
  }

  const decodedToken = verifyAccessToken(token);
  const user = await getAuthenticatedUser(decodedToken.sub);

  return user;
};