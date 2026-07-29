import { apiRequest } from '@/lib/apiClient';
import type { ManualOrderRequest, ManualOrderResponse, OpenTradesResponse, TradeHistoryResponse } from '@/types';

export const submitManualOrder = (payload: ManualOrderRequest) =>
  apiRequest<ManualOrderResponse>('/trades/orders/manual', { method: 'POST', body: payload });

export const fetchOpenTrades = () => apiRequest<OpenTradesResponse>('/trades/open');

export const fetchTradeHistory = () => apiRequest<TradeHistoryResponse>('/trades/history');
