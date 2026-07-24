import { loginUser, registerUser } from '../services/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const register = asyncHandler(async (request, response) => {
  const result = await registerUser(request.body);

  return sendSuccess(response, {
    statusCode: 201,
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (request, response) => {
  const result = await loginUser(request.body);

  return sendSuccess(response, {
    message: 'Login successful',
    data: result,
  });
});

export const getCurrentUser = asyncHandler(async (request, response) =>
  sendSuccess(response, {
    message: 'Authenticated user fetched successfully',
    data: {
      user: request.user,
    },
  }),
);