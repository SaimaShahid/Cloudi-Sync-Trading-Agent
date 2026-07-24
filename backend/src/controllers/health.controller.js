import { getHealthStatusPayload } from '../services/health.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getHealthStatus = asyncHandler(async (request, response) => {
  const payload = getHealthStatusPayload();

  return sendSuccess(response, {
    message: 'Backend is healthy',
    data: payload,
  });
});