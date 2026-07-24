import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from './env.js';

export const logger = pino({
  level: env.logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers.set-cookie',
      'password',
      'passwordHash',
      '*.password',
      '*.passwordHash',
      'token',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  transport:
    env.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});

export const httpLogger = pinoHttp({ logger });