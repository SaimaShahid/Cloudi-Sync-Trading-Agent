import { Router } from 'express';

import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { docsRouter } from './docs.routes.js';
import { notificationRouter } from './notification.routes.js';
import { portfolioRouter } from './portfolio.routes.js';
import { tradeRouter } from './trade.routes.js';
import { userRouter } from './user.routes.js';
import { getHealthStatus } from '../controllers/health.controller.js';

export const apiRouter = Router();

apiRouter.get('/health', getHealthStatus);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/docs', docsRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/portfolio', portfolioRouter);
apiRouter.use('/trades', tradeRouter);
apiRouter.use('/users', userRouter);