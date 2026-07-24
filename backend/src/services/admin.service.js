import { getTradingEngineHealthStatus } from '../integrations/trading-engine/trading-engine.client.js';

export const getAdminAccessPayload = (user) => ({
  access: 'granted',
  scope: 'admin',
  user,
  timestamp: new Date().toISOString(),
});

export const getTradingEngineHealthPayload = async (user) => {
  const engineHealth = await getTradingEngineHealthStatus();

  return {
    requestedBy: user,
    tradingEngine: engineHealth,
    checkedAt: new Date().toISOString(),
  };
};