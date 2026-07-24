import { randomUUID } from 'node:crypto';

import {
  getTradingEngineTradeHistory,
  getTradingEngineOpenTrades,
  submitTradingEngineManualOrder,
} from '../integrations/trading-engine/trading-engine.client.js';
import {
  mapManualTradeOrderRequest,
  mapOpenTrades,
  mapTradeHistory,
} from '../integrations/trading-engine/trading-engine.mapper.js';
import { emitTradeUpdate } from '../sockets/socket-broadcaster.js';
import { ORDER_TYPES, TIME_IN_FORCE, TRADE_SIDES } from '../utils/trade.js';

const buildTradeMetadata = () => ({
  generatedAt: new Date().toISOString(),
  sources: {
    backend: 'live',
    tradingEngine: 'pending',
    marketData: 'pending',
  },
});

const buildUserScope = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const createManualTradeOrderRequest = async (user, payload) => {
  const normalizedOrder = {
    symbol: payload.symbol.toUpperCase(),
    side: payload.side,
    orderType: payload.orderType,
    quantity: Number(payload.quantity),
    price: payload.price !== undefined ? Number(payload.price) : null,
    stopPrice: payload.stopPrice !== undefined ? Number(payload.stopPrice) : null,
    timeInForce: payload.timeInForce ?? TIME_IN_FORCE.GTC,
    note: payload.note ?? null,
  };

  const engineOrderResponse = await submitTradingEngineManualOrder(user, normalizedOrder);

  const orderPayload = mapManualTradeOrderRequest({
    requestId: randomUUID(),
    user: buildUserScope(user),
    normalizedOrder,
    engineOrderResponse,
    supportedValues: {
      sides: Object.values(TRADE_SIDES),
      orderTypes: Object.values(ORDER_TYPES),
      timeInForce: Object.values(TIME_IN_FORCE),
    },
    metadata: buildTradeMetadata(),
  });

  emitTradeUpdate(user.id, {
    channel: 'order',
    payload: orderPayload,
  });

  return orderPayload;
};

export const getOpenTradesPayload = async (user) => {
  const engineOpenTrades = await getTradingEngineOpenTrades(user);

  const openTradesPayload = mapOpenTrades({
    user: buildUserScope(user),
    engineOpenTrades,
    metadata: buildTradeMetadata(),
  });

  emitTradeUpdate(user.id, {
    channel: 'open',
    payload: openTradesPayload,
  });

  return openTradesPayload;
};

export const getTradeHistoryPayload = async (user) => {
  const engineTradeHistory = await getTradingEngineTradeHistory(user);

  const tradeHistoryPayload = mapTradeHistory({
    user: buildUserScope(user),
    engineTradeHistory,
    metadata: buildTradeMetadata(),
  });

  emitTradeUpdate(user.id, {
    channel: 'history',
    payload: tradeHistoryPayload,
  });

  return tradeHistoryPayload;
};