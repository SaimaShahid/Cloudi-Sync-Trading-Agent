import {
  getTradingEngineDashboardSummary,
  getTradingEngineHealthStatus,
} from '../integrations/trading-engine/trading-engine.client.js';
import { mapDashboardSummary } from '../integrations/trading-engine/trading-engine.mapper.js';
import { emitDashboardUpdate } from '../sockets/socket-broadcaster.js';

export const getDashboardSummaryPayload = async (user) => {
  const [engineHealth, engineSummary] = await Promise.all([
    getTradingEngineHealthStatus(),
    getTradingEngineDashboardSummary(user),
  ]);

  const summaryPayload = mapDashboardSummary({ user, engineHealth, engineSummary });

  emitDashboardUpdate(user.id, summaryPayload);

  return summaryPayload;
};