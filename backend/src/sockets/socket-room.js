import { SOCKET_ROOMS } from './socket-events.js';

export const userRoom = (userId) => `${SOCKET_ROOMS.USER_PREFIX}:${userId}`;
export const dashboardRoom = (userId) => `${SOCKET_ROOMS.DASHBOARD_PREFIX}:${userId}`;
export const notificationRoom = (userId) => `${SOCKET_ROOMS.NOTIFICATION_PREFIX}:${userId}`;
export const portfolioRoom = (userId) => `${SOCKET_ROOMS.PORTFOLIO_PREFIX}:${userId}`;
export const tradeRoom = (userId) => `${SOCKET_ROOMS.TRADE_PREFIX}:${userId}`;