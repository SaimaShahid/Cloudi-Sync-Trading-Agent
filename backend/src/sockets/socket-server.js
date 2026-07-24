import { Server } from 'socket.io';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { authenticateSocket } from './socket-auth.js';
import { registerSocketInstance } from './socket-broadcaster.js';
import { SOCKET_SERVER_EVENTS } from './socket-events.js';
import { registerSocketHandlers } from './socket-handlers.js';

let io = null;

export const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  registerSocketInstance(io);

  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user?.id;
    logger.info({ socketId: socket.id, userId }, 'Socket client connected');

    registerSocketHandlers(socket);

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, userId, reason }, 'Socket client disconnected');
    });
  });

  io.engine.on('connection_error', (error) => {
    logger.warn({ error: error.message }, 'Socket connection error');
  });

  logger.info('Socket.IO server initialized');

  return io;
};

export const getSocketServer = () => io;