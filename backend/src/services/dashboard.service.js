import {
  getTradingEngineDashboardSummary,
  getTradingEngineHealthStatus,
} from '../integrations/trading-engine/trading-engine.client.js';
import { mapDashboardSummary } from '../integrations/trading-engine/trading-engine.mapper.js';

export const getDashboardSummaryPayload = async (user) => {
  const [engineHealth, engineSummary] = await Promise.all([
    getTradingEngineHealthStatus(),
    getTradingEngineDashboardSummary(user),
  ]);

  return mapDashboardSummary({ user, engineHealth, engineSummary });
};