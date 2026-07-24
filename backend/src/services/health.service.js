import mongoose from 'mongoose';

export const getHealthStatusPayload = () => ({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
});