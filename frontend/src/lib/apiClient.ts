import type { ApiEnvelope } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

const TOKEN_STORAGE_KEY = 'cloudi_sync_token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: { fields?: Array<{ path?: string; msg?: string }> };

  constructor(message: string, statusCode: number, code?: string, details?: ApiError['details']) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message ?? payload?.error?.message ?? `Request failed with status ${response.status}`;
    const code = payload?.error?.code;
    const details = payload?.error?.details;
    throw new ApiError(message, response.status, code, details);
  }

  return (payload as ApiEnvelope<T>).data;
};

export const formatApiError = (err: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (err instanceof ApiError) {
    const fieldMessages = err.details?.fields?.map((field) => field.msg).filter(Boolean) ?? [];
    if (fieldMessages.length > 0) {
      return fieldMessages.join(' ');
    }
    return err.message;
  }
  return fallback;
};
