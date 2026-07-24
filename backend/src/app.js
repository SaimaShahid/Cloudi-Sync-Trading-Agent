import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { httpLogger } from './config/logger.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';
import { enforceHttpsInProduction } from './middleware/security.middleware.js';
import { apiRouter } from './routes/index.js';

const app = express();

if (env.trustProxyEnabled) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(httpLogger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(enforceHttpsInProduction);
app.use(apiRateLimiter);

app.use(env.apiPrefix, apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;