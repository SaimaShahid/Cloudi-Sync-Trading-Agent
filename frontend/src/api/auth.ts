import { apiRequest } from '@/lib/apiClient';
import type { AuthPayload, AuthUser } from '@/types';

export const registerAccount = (payload: { name: string; email: string; password: string }) =>
  apiRequest<AuthPayload>('/auth/register', { method: 'POST', body: payload, auth: false });

export const loginAccount = (payload: { email: string; password: string }) =>
  apiRequest<AuthPayload>('/auth/login', { method: 'POST', body: payload, auth: false });

export const fetchCurrentUser = () => apiRequest<{ user: AuthUser }>('/auth/me');
