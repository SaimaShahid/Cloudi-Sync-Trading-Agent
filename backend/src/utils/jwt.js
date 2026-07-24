import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from './app-error.js';

export const signAccessToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    {
      algorithm: 'HS256',
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
      subject: String(user.id),
      expiresIn: env.jwtExpiresIn,
    },
  );

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    });
  } catch {
    throw new AppError('Invalid or expired authentication token', 401, 'AUTH_TOKEN_INVALID');
  }
};