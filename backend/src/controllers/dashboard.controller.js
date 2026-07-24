import { getDashboardSummaryPayload } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getDashboardSummary = asyncHandler(async (request, response) => {
  const summary = await getDashboardSummaryPayload(request.user);

  return sendSuccess(response, {
    message: 'Dashboard summary fetched successfully',
    data: summary,
  });
});