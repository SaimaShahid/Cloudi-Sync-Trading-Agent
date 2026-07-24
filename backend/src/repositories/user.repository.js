import { User } from '../models/user.model.js';

export const createUser = async ({ name, email, passwordHash, role = 'user' }) =>
  User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });

export const findUserByEmail = async (email, options = {}) => {
  const query = User.findOne({ email: email.toLowerCase() });

  if (options.includePasswordHash) {
    query.select('+passwordHash');
  }

  return query.exec();
};

export const findUserById = async (userId) => User.findById(userId).exec();

export const listUsers = async () => User.find().sort({ createdAt: -1 }).exec();

export const updateUserById = async (userId, updates) => {
  const user = await User.findById(userId).exec();

  if (!user) {
    return null;
  }

  Object.assign(user, updates);
  await user.save();

  return user;
};