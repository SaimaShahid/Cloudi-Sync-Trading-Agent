import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];

const missingVariables = requiredVariables.filter((variableName) => !process.env[variableName]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

const parseCorsOrigins = (value) => {
  if (!value || value === '*') {
    return true;
  }

  return value.split(',').map((origin) => origin.trim());
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
});