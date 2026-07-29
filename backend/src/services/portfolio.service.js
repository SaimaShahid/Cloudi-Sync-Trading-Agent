import {
  getTradingEnginePortfolioHoldings,
  getTradingEnginePortfolioSummary,
} from '../integrations/trading-engine/trading-engine.client.js';
import { mapPortfolioHoldings, mapPortfolioSummary } from '../integrations/trading-engine/trading-engine.mapper.js';

export const getPortfolioSummaryPayload = async (user) => {
  const enginePortfolioSummary = await getTradingEnginePortfolioSummary(user);

  return mapPortfolioSummary({ user, enginePortfolioSummary });
};

export const getPortfolioHoldingsPayload = async (user) => {
  const enginePortfolioHoldings = await getTradingEnginePortfolioHoldings(user);

  return mapPortfolioHoldings({ user, enginePortfolioHoldings });
};