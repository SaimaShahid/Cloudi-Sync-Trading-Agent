import bcrypt from 'bcrypt';

import { env } from '../config/env.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';
import { signAccessToken } from '../utils/jwt.js';

const buildAuthPayload = (user) => ({
  token: signAccessToken(user),
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await createUser({ name, email, passwordHash });

  return buildAuthPayload(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email, { includePasswordHash: true });

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  return buildAuthPayload(user);
};

export const getAuthenticatedUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('Authenticated user no longer exists', 401, 'AUTH_USER_NOT_FOUND');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};