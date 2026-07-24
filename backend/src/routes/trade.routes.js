import { Router } from 'express';

import {
  createManualTradeOrder,
  getOpenTrades,
  getTradeHistory,
} from '../controllers/trade.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { manualTradeOrderValidator } from '../validators/trade.validator.js';

export const tradeRouter = Router();

tradeRouter.post('/orders/manual', requireAuth, manualTradeOrderValidator, validateRequest, createManualTradeOrder);
tradeRouter.get('/open', requireAuth, getOpenTrades);
tradeRouter.get('/history', requireAuth, getTradeHistory);