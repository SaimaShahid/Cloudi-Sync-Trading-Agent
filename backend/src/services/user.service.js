import { findUserByEmail, findUserById, listUsers, updateUserById } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getCurrentUserProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return toSafeUser(user);
};

export const updateOwnProfile = async (userId, payload) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const updates = {};

  if (payload.name !== undefined) {
    updates.name = payload.name;
  }

  if (payload.email !== undefined) {
    const normalizedEmail = payload.email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser && existingUser.id !== userId) {
      throw new AppError('Email is already in use', 409, 'EMAIL_ALREADY_IN_USE');
    }

    updates.email = normalizedEmail;
  }

  const updatedUser = await updateUserById(userId, updates);

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return toSafeUser(updatedUser);
};

export const getUsers = async () => {
  const users = await listUsers();

  return users.map(toSafeUser);
};

export const changeUserRole = async (userId, role) => {
  const updatedUser = await updateUserById(userId, { role });

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return toSafeUser(updatedUser);
};