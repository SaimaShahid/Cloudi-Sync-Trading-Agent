import { getPortfolioHoldingsPayload, getPortfolioSummaryPayload } from '../services/portfolio.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getPortfolioSummary = asyncHandler(async (request, response) => {
  const summary = await getPortfolioSummaryPayload(request.user);

  return sendSuccess(response, {
    message: 'Portfolio summary fetched successfully',
    data: summary,
  });
});

export const getPortfolioHoldings = asyncHandler(async (request, response) => {
  const holdings = await getPortfolioHoldingsPayload(request.user);

  return sendSuccess(response, {
    message: 'Portfolio holdings fetched successfully',
    data: holdings,
  });
});