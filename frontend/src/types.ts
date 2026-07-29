// ---- Auth ----

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

// ---- Envelope shared by every backend response ----

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// ---- Dashboard ----

export interface DashboardSummary {
  user: AuthUser;
  overview: {
    tradingMode: string;
    portfolioValue: number | null;
    dailyPnl: number | null;
    openPositions: number;
    activeStrategies: number;
  };
  tradingEngine: {
    status: string;
    lastHeartbeatAt: string | null;
    message: string;
  };
  marketSnapshot: {
    status: string;
    topSymbols: string[];
    message: string;
  };
  recentSignals: unknown[];
  notifications: {
    unreadCount: number;
    status: string;
  };
  metadata: {
    generatedAt: string;
    sources: Record<string, string>;
  };
}

// ---- Portfolio ----

export interface PortfolioSummary {
  user: AuthUser;
  summary: {
    totalEquity: number | null;
    availableCash: number | null;
    investedAmount: number | null;
    unrealizedPnl: number | null;
    realizedPnl: number | null;
    dayChange: number | null;
    holdingsCount: number;
  };
  allocation: {
    status: string;
    assets: unknown[];
  };
  performance: {
    status: string;
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
  };
  integration: {
    status: string;
    message: string;
  };
  metadata: {
    generatedAt: string;
    valuationCurrency: string;
    sources: Record<string, string>;
  };
}

export interface PortfolioHolding {
  symbol: string;
  name?: string;
  quantity?: number;
  averagePrice?: number;
  marketValue?: number;
  unrealizedPnl?: number;
  [key: string]: unknown;
}

export interface PortfolioHoldings {
  user: AuthUser;
  holdings: PortfolioHolding[];
  totals: {
    holdingsCount: number;
    marketValue: number | null;
    costBasis: number | null;
    unrealizedPnl: number | null;
  };
  integration: {
    status: string;
    message: string;
  };
  metadata: {
    generatedAt: string;
    valuationCurrency: string;
    sources: Record<string, string>;
  };
}

// ---- Trades ----

export type TradeSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop_limit';
export type TimeInForce = 'gtc' | 'ioc' | 'fok';

export interface ManualOrderRequest {
  symbol: string;
  side: TradeSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  note?: string;
}

export interface ManualOrderResponse {
  requestId: string;
  user: Pick<AuthUser, 'id' | 'name' | 'email' | 'role'>;
  order: ManualOrderRequest & { symbol: string };
  workflow: {
    submissionStatus: string;
    executionStatus: string;
    nextStep: string;
  };
  integration: {
    status: string;
    message: string;
    response: unknown;
  };
  supportedValues: {
    sides: TradeSide[];
    orderTypes: OrderType[];
    timeInForce: TimeInForce[];
  };
  metadata: {
    generatedAt: string;
    sources: Record<string, string>;
  };
}

export interface OpenTradesResponse {
  user: unknown;
  openTrades: unknown[];
  summary: {
    openTradeCount: number;
    totalNotionalExposure: number | null;
    unrealizedPnl: number | null;
  };
  integration: {
    status: string;
    message: string;
  };
  metadata: unknown;
}

export interface TradeHistoryResponse {
  user: unknown;
  trades: unknown[];
  summary: {
    totalTrades: number;
    realizedPnl: number | null;
    winRate: number | null;
  };
  filters: {
    supported: string[];
    applied: Record<string, unknown>;
  };
  integration: {
    status: string;
    message: string;
  };
  metadata: unknown;
}

// ---- Notifications ----

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
  };
  unreadCount: number;
}

// ---- Demo-only data (Markets table, About/FAQ) — clearly not backend-sourced ----

export interface DemoCoin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: string;
  sparkline: number[];
  category: 'layer1' | 'defi' | 'ai_cloud' | 'infrastructure';
  isStarred?: boolean;
  auditScore?: number;
  auditStatus?: 'PASSED' | 'WARNING' | 'FAILED';
  description?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'trading' | 'security' | 'account';
}
