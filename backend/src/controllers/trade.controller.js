import {
  createManualTradeOrderRequest,
  getOpenTradesPayload,
  getTradeHistoryPayload,
} from '../services/trade.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const createManualTradeOrder = asyncHandler(async (request, response) => {
  const orderRequest = await createManualTradeOrderRequest(request.user, request.body);

  return sendSuccess(response, {
    statusCode: 202,
    message: 'Manual trade order request accepted by backend',
    data: orderRequest,
  });
});

export const getOpenTrades = asyncHandler(async (request, response) => {
  const openTrades = await getOpenTradesPayload(request.user);

  return sendSuccess(response, {
    message: 'Open trades fetched successfully',
    data: openTrades,
  });
});

export const getTradeHistory = asyncHandler(async (request, response) => {
  const tradeHistory = await getTradeHistoryPayload(request.user);

  return sendSuccess(response, {
    message: 'Trade history fetched successfully',
    data: tradeHistory,
  });
});