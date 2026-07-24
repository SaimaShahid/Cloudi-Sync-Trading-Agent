const buildUserScope = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const buildSourceState = (engineResponse) => (engineResponse.ok ? 'live' : engineResponse.status);

const buildEngineMessage = (engineResponse, fallbackMessage) => engineResponse.message ?? fallbackMessage;

export const mapDashboardSummary = ({ user, engineHealth, engineSummary }) => ({
  user: buildUserScope(user),
  overview: {
    tradingMode: engineSummary.ok ? engineSummary.data?.overview?.tradingMode ?? 'live' : 'integration_fallback',
    portfolioValue: engineSummary.data?.overview?.portfolioValue ?? null,
    dailyPnl: engineSummary.data?.overview?.dailyPnl ?? null,
    openPositions: engineSummary.data?.overview?.openPositions ?? 0,
    activeStrategies: engineSummary.data?.overview?.activeStrategies ?? 0,
  },
  tradingEngine: {
    status: engineHealth.status,
    lastHeartbeatAt: engineHealth.details?.lastHeartbeatAt ?? null,
    message: engineHealth.message,
  },
  marketSnapshot: {
    status: engineSummary.ok ? engineSummary.data?.marketSnapshot?.status ?? 'pending_market_data' : 'pending_market_data',
    topSymbols: engineSummary.data?.marketSnapshot?.topSymbols ?? [],
    message: engineSummary.data?.marketSnapshot?.message ?? 'Market data integration will be connected in a later phase.',
  },
  recentSignals: engineSummary.data?.recentSignals ?? [],
  notifications: {
    unreadCount: 0,
    status: 'pending_notification_module',
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    sources: {
      backend: 'live',
      tradingEngine: buildSourceState(engineSummary),
      marketData: engineSummary.ok ? 'engine_forwarded' : 'pending',
      notifications: 'pending',
    },
  },
});

export const mapPortfolioSummary = ({ user, enginePortfolioSummary }) => ({
  user: buildUserScope(user),
  summary: {
    totalEquity: enginePortfolioSummary.data?.summary?.totalEquity ?? null,
    availableCash: enginePortfolioSummary.data?.summary?.availableCash ?? null,
    investedAmount: enginePortfolioSummary.data?.summary?.investedAmount ?? null,
    unrealizedPnl: enginePortfolioSummary.data?.summary?.unrealizedPnl ?? null,
    realizedPnl: enginePortfolioSummary.data?.summary?.realizedPnl ?? null,
    dayChange: enginePortfolioSummary.data?.summary?.dayChange ?? null,
    holdingsCount: enginePortfolioSummary.data?.summary?.holdingsCount ?? 0,
  },
  allocation: {
    status: enginePortfolioSummary.ok ? enginePortfolioSummary.data?.allocation?.status ?? 'live' : 'pending_integration',
    assets: enginePortfolioSummary.data?.allocation?.assets ?? [],
  },
  performance: {
    status: enginePortfolioSummary.ok ? enginePortfolioSummary.data?.performance?.status ?? 'live' : 'pending_integration',
    daily: enginePortfolioSummary.data?.performance?.daily ?? null,
    weekly: enginePortfolioSummary.data?.performance?.weekly ?? null,
    monthly: enginePortfolioSummary.data?.performance?.monthly ?? null,
  },
  integration: {
    status: enginePortfolioSummary.status,
    message: buildEngineMessage(enginePortfolioSummary, 'Portfolio summary is currently using fallback values.'),
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    valuationCurrency: enginePortfolioSummary.data?.metadata?.valuationCurrency ?? 'USD',
    sources: {
      backend: 'live',
      tradingEngine: buildSourceState(enginePortfolioSummary),
      marketData: enginePortfolioSummary.ok ? 'engine_forwarded' : 'pending',
    },
  },
});

export const mapPortfolioHoldings = ({ user, enginePortfolioHoldings }) => ({
  user: buildUserScope(user),
  holdings: enginePortfolioHoldings.data?.holdings ?? [],
  totals: {
    holdingsCount: enginePortfolioHoldings.data?.totals?.holdingsCount ?? 0,
    marketValue: enginePortfolioHoldings.data?.totals?.marketValue ?? null,
    costBasis: enginePortfolioHoldings.data?.totals?.costBasis ?? null,
    unrealizedPnl: enginePortfolioHoldings.data?.totals?.unrealizedPnl ?? null,
  },
  integration: {
    status: enginePortfolioHoldings.status,
    message: buildEngineMessage(enginePortfolioHoldings, 'Portfolio holdings are currently using fallback values.'),
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    valuationCurrency: enginePortfolioHoldings.data?.metadata?.valuationCurrency ?? 'USD',
    sources: {
      backend: 'live',
      tradingEngine: buildSourceState(enginePortfolioHoldings),
      marketData: enginePortfolioHoldings.ok ? 'engine_forwarded' : 'pending',
    },
  },
});

export const mapManualTradeOrderRequest = ({ requestId, user, normalizedOrder, engineOrderResponse, supportedValues, metadata }) => ({
  requestId,
  user,
  order: normalizedOrder,
  workflow: {
    submissionStatus: 'accepted_by_backend',
    executionStatus: engineOrderResponse.ok ? 'forwarded_to_trading_engine' : 'pending_trading_engine_retry',
    nextStep: engineOrderResponse.ok
      ? 'Order request was forwarded to the trading engine.'
      : 'Trading engine is not available. The backend request contract is valid, but execution remains pending integration availability.',
  },
  integration: {
    status: engineOrderResponse.status,
    message: buildEngineMessage(engineOrderResponse, 'Trading engine order forwarding is currently unavailable.'),
    response: engineOrderResponse.data,
  },
  supportedValues,
  metadata,
});

export const mapOpenTrades = ({ user, engineOpenTrades, metadata }) => ({
  user,
  openTrades: engineOpenTrades.data?.openTrades ?? [],
  summary: {
    openTradeCount: engineOpenTrades.data?.summary?.openTradeCount ?? 0,
    totalNotionalExposure: engineOpenTrades.data?.summary?.totalNotionalExposure ?? null,
    unrealizedPnl: engineOpenTrades.data?.summary?.unrealizedPnl ?? null,
  },
  integration: {
    status: engineOpenTrades.status,
    message: buildEngineMessage(engineOpenTrades, 'Open trades are currently using fallback values.'),
  },
  metadata,
});

export const mapTradeHistory = ({ user, engineTradeHistory, metadata }) => ({
  user,
  trades: engineTradeHistory.data?.trades ?? [],
  summary: {
    totalTrades: engineTradeHistory.data?.summary?.totalTrades ?? 0,
    realizedPnl: engineTradeHistory.data?.summary?.realizedPnl ?? null,
    winRate: engineTradeHistory.data?.summary?.winRate ?? null,
  },
  filters: {
    supported: ['symbol', 'side', 'status', 'from', 'to', 'page', 'limit'],
    applied: engineTradeHistory.data?.filters?.applied ?? {},
  },
  integration: {
    status: engineTradeHistory.status,
    message: buildEngineMessage(engineTradeHistory, 'Trade history is currently using fallback values.'),
  },
  metadata,
});