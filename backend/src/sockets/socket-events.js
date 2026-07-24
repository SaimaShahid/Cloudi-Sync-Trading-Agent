export const SOCKET_SERVER_EVENTS = Object.freeze({
  READY: 'system:ready',
  ERROR: 'system:error',
  DASHBOARD_UPDATE: 'dashboard:update',
  NOTIFICATION_UPDATE: 'notification:update',
  PORTFOLIO_UPDATE: 'portfolio:update',
  TRADE_UPDATE: 'trade:update',
});

export const SOCKET_CLIENT_EVENTS = Object.freeze({
  PING: 'system:ping',
  DASHBOARD_SUBSCRIBE: 'dashboard:subscribe',
  DASHBOARD_UNSUBSCRIBE: 'dashboard:unsubscribe',
  NOTIFICATION_SUBSCRIBE: 'notification:subscribe',
  NOTIFICATION_UNSUBSCRIBE: 'notification:unsubscribe',
  PORTFOLIO_SUBSCRIBE: 'portfolio:subscribe',
  PORTFOLIO_UNSUBSCRIBE: 'portfolio:unsubscribe',
  TRADE_SUBSCRIBE: 'trade:subscribe',
  TRADE_UNSUBSCRIBE: 'trade:unsubscribe',
});

export const SOCKET_ROOMS = Object.freeze({
  USER_PREFIX: 'user',
  DASHBOARD_PREFIX: 'dashboard',
  NOTIFICATION_PREFIX: 'notification',
  PORTFOLIO_PREFIX: 'portfolio',
  TRADE_PREFIX: 'trade',
});