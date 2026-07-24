import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
import {
  getCurrentUserProfile,
  getUsers,
  changeUserRole,
  updateOwnProfile,
} from '../services/user.service.js';

export const viewCurrentUserProfile = asyncHandler(async (request, response) => {
  const profile = await getCurrentUserProfile(request.user.id);

  return sendSuccess(response, {
    message: 'User profile fetched successfully',
    data: {
      user: profile,
    },
  });
});

export const updateCurrentUserProfile = asyncHandler(async (request, response) => {
  const updatedUser = await updateOwnProfile(request.user.id, request.body);

  return sendSuccess(response, {
    message: 'User profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

export const listUsers = asyncHandler(async (request, response) => {
  const users = await getUsers();

  return sendSuccess(response, {
    message: 'Users fetched successfully',
    data: {
      users,
    },
  });
});

export const updateUserRole = asyncHandler(async (request, response) => {
  const updatedUser = await changeUserRole(request.params.userId, request.body.role);

  return sendSuccess(response, {
    message: 'User role updated successfully',
    data: {
      user: updatedUser,
    },
  });
});