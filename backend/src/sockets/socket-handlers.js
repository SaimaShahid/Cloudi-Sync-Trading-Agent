import { logger } from '../config/logger.js';
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS } from './socket-events.js';
import { dashboardRoom, notificationRoom, portfolioRoom, tradeRoom, userRoom } from './socket-room.js';

const ackSuccess = (ack, payload) => {
  if (typeof ack === 'function') {
    ack({ success: true, ...payload });
  }
};

const ackError = (ack, message) => {
  if (typeof ack === 'function') {
    ack({ success: false, message });
  }
};

export const registerSocketHandlers = (socket) => {
  const userId = socket.data.user.id;

  socket.join(userRoom(userId));

  socket.emit(SOCKET_SERVER_EVENTS.READY, {
    message: 'Socket connection established',
    userId,
    timestamp: new Date().toISOString(),
  });

  socket.on(SOCKET_CLIENT_EVENTS.PING, (payload, ack) => {
    void payload;
    ackSuccess(ack, {
      event: SOCKET_CLIENT_EVENTS.PING,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on(SOCKET_CLIENT_EVENTS.DASHBOARD_SUBSCRIBE, (payload, ack) => {
    void payload;
    socket.join(dashboardRoom(userId));
    ackSuccess(ack, { room: dashboardRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.DASHBOARD_UNSUBSCRIBE, (payload, ack) => {
    void payload;
    socket.leave(dashboardRoom(userId));
    ackSuccess(ack, { room: dashboardRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.NOTIFICATION_SUBSCRIBE, (payload, ack) => {
    void payload;
    socket.join(notificationRoom(userId));
    ackSuccess(ack, { room: notificationRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.NOTIFICATION_UNSUBSCRIBE, (payload, ack) => {
    void payload;
    socket.leave(notificationRoom(userId));
    ackSuccess(ack, { room: notificationRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.PORTFOLIO_SUBSCRIBE, (payload, ack) => {
    void payload;
    socket.join(portfolioRoom(userId));
    ackSuccess(ack, { room: portfolioRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.PORTFOLIO_UNSUBSCRIBE, (payload, ack) => {
    void payload;
    socket.leave(portfolioRoom(userId));
    ackSuccess(ack, { room: portfolioRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.TRADE_SUBSCRIBE, (payload, ack) => {
    void payload;
    socket.join(tradeRoom(userId));
    ackSuccess(ack, { room: tradeRoom(userId) });
  });

  socket.on(SOCKET_CLIENT_EVENTS.TRADE_UNSUBSCRIBE, (payload, ack) => {
    void payload;
    socket.leave(tradeRoom(userId));
    ackSuccess(ack, { room: tradeRoom(userId) });
  });

  socket.on('error', (error) => {
    logger.warn({ error, userId }, 'Socket error');
    ackError(null, 'Socket error occurred');
  });
};