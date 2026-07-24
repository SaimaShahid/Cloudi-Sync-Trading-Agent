import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];

const missingVariables = requiredVariables.filter((variableName) => !process.env[variableName]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

const parseCorsOrigins = (value) => {
  if (!value || value === '*') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CORS_ORIGIN must be explicitly configured in production');
    }

    return true;
  }

  return value.split(',').map((origin) => origin.trim());
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === 'true';
};

const parseNumber = (value, defaultValue) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return defaultValue;
  }

  return parsedValue;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseNumber(process.env.PORT, 3000),
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  jwtIssuer: process.env.JWT_ISSUER ?? 'cloudi-sync-backend',
  jwtAudience: process.env.JWT_AUDIENCE ?? 'cloudi-sync-frontend',
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  trustProxyEnabled: parseBoolean(process.env.TRUST_PROXY_ENABLED, false),
  enforceHttpsInProduction: parseBoolean(process.env.ENFORCE_HTTPS_IN_PROD, false),
  authRateLimitWindowMs: parseNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000,
  authRateLimitMaxAttempts: parseNumber(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS, 20),
  tradingEngineEnabled: parseBoolean(process.env.TRADING_ENGINE_ENABLED, false),
  tradingEngineBaseUrl: process.env.TRADING_ENGINE_BASE_URL ?? 'http://127.0.0.1:8000',
  tradingEngineTimeoutMs: parseNumber(process.env.TRADING_ENGINE_TIMEOUT_MS, 5000),
  tradingEngineApiKey: process.env.TRADING_ENGINE_API_KEY ?? null,
});