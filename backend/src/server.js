import http from 'node:http';

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();

  server.listen(env.port, () => {
    logger.info({ port: env.port, environment: env.nodeEnv }, 'Backend server started');
  });
};

const shutdown = (signal) => {
  logger.warn({ signal }, 'Shutdown signal received');

  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Error while closing HTTP server');
      process.exit(1);
    }

    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  logger.fatal({ error }, 'Backend failed to start');
  process.exit(1);
});