import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { getHealthStatus } from '../controllers/health.controller.js';

export const apiRouter = Router();

apiRouter.get('/health', getHealthStatus);
apiRouter.use('/auth', authRouter);