import {
  getTradingEnginePortfolioHoldings,
  getTradingEnginePortfolioSummary,
} from '../integrations/trading-engine/trading-engine.client.js';
import { mapPortfolioHoldings, mapPortfolioSummary } from '../integrations/trading-engine/trading-engine.mapper.js';
import { emitPortfolioUpdate } from '../sockets/socket-broadcaster.js';

export const getPortfolioSummaryPayload = async (user) => {
  const enginePortfolioSummary = await getTradingEnginePortfolioSummary(user);

  const summaryPayload = mapPortfolioSummary({ user, enginePortfolioSummary });

  emitPortfolioUpdate(user.id, {
    channel: 'summary',
    payload: summaryPayload,
  });

  return summaryPayload;
};

export const getPortfolioHoldingsPayload = async (user) => {
  const enginePortfolioHoldings = await getTradingEnginePortfolioHoldings(user);

  const holdingsPayload = mapPortfolioHoldings({ user, enginePortfolioHoldings });

  emitPortfolioUpdate(user.id, {
    channel: 'holdings',
    payload: holdingsPayload,
  });

  return holdingsPayload;
};