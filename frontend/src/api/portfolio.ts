import { apiRequest } from '@/lib/apiClient';
import type { PortfolioHoldings, PortfolioSummary } from '@/types';

export const fetchPortfolioSummary = () => apiRequest<PortfolioSummary>('/portfolio/summary');

export const fetchPortfolioHoldings = () => apiRequest<PortfolioHoldings>('/portfolio/holdings');
