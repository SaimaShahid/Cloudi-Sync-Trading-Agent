import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';

export const SOCKET_SERVER_EVENTS = Object.freeze({
  READY: 'system:ready',
  ERROR: 'system:error',
  DASHBOARD_UPDATE: 'dashboard:update',
  NOTIFICATION_UPDATE: 'notification:update',
  PORTFOLIO_UPDATE: 'portfolio:update',
  TRADE_UPDATE: 'trade:update',
});

export const SOCKET_CLIENT_EVENTS = Object.freeze({
  DASHBOARD_SUBSCRIBE: 'dashboard:subscribe',
  DASHBOARD_UNSUBSCRIBE: 'dashboard:unsubscribe',
  NOTIFICATION_SUBSCRIBE: 'notification:subscribe',
  NOTIFICATION_UNSUBSCRIBE: 'notification:unsubscribe',
  PORTFOLIO_SUBSCRIBE: 'portfolio:subscribe',
  PORTFOLIO_UNSUBSCRIBE: 'portfolio:unsubscribe',
  TRADE_SUBSCRIBE: 'trade:subscribe',
  TRADE_UNSUBSCRIBE: 'trade:unsubscribe',
});

export const createCloudiSocket = (token: string): Socket =>
  io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
  });
