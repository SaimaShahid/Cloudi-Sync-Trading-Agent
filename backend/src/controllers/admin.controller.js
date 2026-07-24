import { getAdminAccessPayload, getTradingEngineHealthPayload } from '../services/admin.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getAdminAccessCheck = asyncHandler(async (request, response) => {
  const payload = getAdminAccessPayload(request.user);

  return sendSuccess(response, {
    message: 'Admin access confirmed',
    data: payload,
  });
});

export const getTradingEngineHealth = asyncHandler(async (request, response) => {
  const payload = await getTradingEngineHealthPayload(request.user);

  return sendSuccess(response, {
    message: 'Trading engine health fetched successfully',
    data: payload,
  });
});