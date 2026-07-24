import { logger } from '../config/logger.js';
import { SOCKET_SERVER_EVENTS } from './socket-events.js';
import { dashboardRoom, notificationRoom, portfolioRoom, tradeRoom, userRoom } from './socket-room.js';

let ioInstance = null;

export const registerSocketInstance = (io) => {
  ioInstance = io;
};

const emitToRoom = (room, event, payload) => {
  if (!ioInstance) {
    logger.debug({ room, event }, 'Socket.IO not initialized; skipped event emit');
    return;
  }

  ioInstance.to(room).emit(event, payload);
};

export const emitToUser = (userId, event, payload) => emitToRoom(userRoom(userId), event, payload);

export const emitDashboardUpdate = (userId, payload) => {
  emitToUser(userId, SOCKET_SERVER_EVENTS.DASHBOARD_UPDATE, payload);
  emitToRoom(dashboardRoom(userId), SOCKET_SERVER_EVENTS.DASHBOARD_UPDATE, payload);
};

export const emitNotificationUpdate = (userId, payload) => {
  emitToUser(userId, SOCKET_SERVER_EVENTS.NOTIFICATION_UPDATE, payload);
  emitToRoom(notificationRoom(userId), SOCKET_SERVER_EVENTS.NOTIFICATION_UPDATE, payload);
};

export const emitPortfolioUpdate = (userId, payload) => {
  emitToUser(userId, SOCKET_SERVER_EVENTS.PORTFOLIO_UPDATE, payload);
  emitToRoom(portfolioRoom(userId), SOCKET_SERVER_EVENTS.PORTFOLIO_UPDATE, payload);
};

export const emitTradeUpdate = (userId, payload) => {
  emitToUser(userId, SOCKET_SERVER_EVENTS.TRADE_UPDATE, payload);
  emitToRoom(tradeRoom(userId), SOCKET_SERVER_EVENTS.TRADE_UPDATE, payload);
};