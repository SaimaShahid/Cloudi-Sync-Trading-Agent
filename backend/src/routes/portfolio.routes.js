import { Router } from 'express';

import { getPortfolioHoldings, getPortfolioSummary } from '../controllers/portfolio.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const portfolioRouter = Router();

portfolioRouter.get('/summary', requireAuth, getPortfolioSummary);
portfolioRouter.get('/holdings', requireAuth, getPortfolioHoldings);