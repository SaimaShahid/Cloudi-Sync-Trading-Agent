import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const buildHeaders = () => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Backend-Source': 'cloudi-sync-backend',
  };

  if (env.tradingEngineApiKey) {
    headers.Authorization = `Bearer ${env.tradingEngineApiKey}`;
  }

  return headers;
};

const disabledResponse = (message = 'Trading engine integration is disabled.') => ({
  ok: false,
  status: 'disabled',
  message,
  data: null,
});

const unavailableResponse = (message, details = null) => ({
  ok: false,
  status: 'unavailable',
  message,
  details,
  data: null,
});

const successResponse = (data, status = 'connected') => ({
  ok: true,
  status,
  message: 'Trading engine request completed successfully.',
  data,
});

const requestTradingEngine = async (path, options = {}) => {
  if (!env.tradingEngineEnabled) {
    return disabledResponse();
  }

  const url = new URL(path, env.tradingEngineBaseUrl);

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: buildHeaders(),
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(env.tradingEngineTimeoutMs),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      logger.warn({ path, statusCode: response.status, body }, 'Trading engine request failed');
      return unavailableResponse('Trading engine returned an error response.', {
        statusCode: response.status,
        body,
      });
    }

    return successResponse(body);
  } catch (error) {
    logger.warn({ error, path }, 'Trading engine request unavailable');
    return unavailableResponse('Trading engine is unavailable.', {
      reason: error.name === 'TimeoutError' ? 'timeout' : 'connection_failed',
    });
  }
};

export const getTradingEngineHealthStatus = async () => {
  const response = await requestTradingEngine('/health');

  if (!response.ok) {
    return {
      enabled: env.tradingEngineEnabled,
      status: response.status,
      message: response.message,
      details: response.details ?? null,
    };
  }

  return {
    enabled: env.tradingEngineEnabled,
    status: 'connected',
    message: 'Trading engine is reachable.',
    details: response.data,
  };
};

export const getTradingEngineDashboardSummary = async (user) =>
  requestTradingEngine(`/api/v1/dashboard/summary?userId=${encodeURIComponent(user.id)}`);

export const getTradingEnginePortfolioSummary = async (user) =>
  requestTradingEngine(`/api/v1/portfolio/summary?userId=${encodeURIComponent(user.id)}`);

export const getTradingEnginePortfolioHoldings = async (user) =>
  requestTradingEngine(`/api/v1/portfolio/holdings?userId=${encodeURIComponent(user.id)}`);

export const submitTradingEngineManualOrder = async (user, order) =>
  requestTradingEngine('/api/v1/trades/orders/manual', {
    method: 'POST',
    body: {
      userId: user.id,
      userRole: user.role,
      order,
    },
  });

export const getTradingEngineOpenTrades = async (user) =>
  requestTradingEngine(`/api/v1/trades/open?userId=${encodeURIComponent(user.id)}`);

export const getTradingEngineTradeHistory = async (user) =>
  requestTradingEngine(`/api/v1/trades/history?userId=${encodeURIComponent(user.id)}`);