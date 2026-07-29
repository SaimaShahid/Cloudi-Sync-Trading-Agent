import { apiRequest } from '@/lib/apiClient';
import type { DashboardSummary } from '@/types';

export const fetchDashboardSummary = () => apiRequest<DashboardSummary>('/dashboard/summary');
