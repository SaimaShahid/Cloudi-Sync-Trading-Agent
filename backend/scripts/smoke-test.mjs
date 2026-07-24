import http from 'node:http';
import mongoose from 'mongoose';

import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

const results = [];
let server;

const push = (name, ok, details = '') => {
  results.push({ name, ok, details });
};

const expectStatus = (name, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }

  push(name, true, `status=${actual}`);
};

const makeRequestFactory = (baseUrl) => async ({ method, path, token, body }) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    status: response.status,
    payload,
  };
};

const run = async () => {
  await connectDatabase();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  const request = makeRequestFactory(baseUrl);

  const email = `smoke_${Date.now()}@example.com`;
  const password = 'SecurePass123!';

  expectStatus('health', (await request({ method: 'GET', path: '/health' })).status, 200);
  expectStatus('docs.openapi', (await request({ method: 'GET', path: '/docs/openapi.json' })).status, 200);
  expectStatus('docs.catalog', (await request({ method: 'GET', path: '/docs/catalog' })).status, 200);

  expectStatus(
    'auth.register',
    (
      await request({
        method: 'POST',
        path: '/auth/register',
        body: {
          name: 'Smoke Tester',
          email,
          password,
        },
      })
    ).status,
    201,
  );

  const login = await request({
    method: 'POST',
    path: '/auth/login',
    body: {
      email,
      password,
    },
  });
  expectStatus('auth.login', login.status, 200);

  const token = login.payload?.data?.token;
  if (!token) {
    throw new Error('auth.login: token missing');
  }
  push('auth.token', true, 'present');

  const me = await request({ method: 'GET', path: '/users/me', token });
  expectStatus('users.me', me.status, 200);
  const userId = me.payload?.data?.user?.id;

  expectStatus(
    'users.patchMe',
    (await request({ method: 'PATCH', path: '/users/me', token, body: { name: 'Smoke Tester Updated' } })).status,
    200,
  );
  expectStatus('users.list.forbidden', (await request({ method: 'GET', path: '/users', token })).status, 403);

  expectStatus('dashboard.summary', (await request({ method: 'GET', path: '/dashboard/summary', token })).status, 200);
  expectStatus('portfolio.summary', (await request({ method: 'GET', path: '/portfolio/summary', token })).status, 200);
  expectStatus('portfolio.holdings', (await request({ method: 'GET', path: '/portfolio/holdings', token })).status, 200);

  expectStatus(
    'trades.manual',
    (
      await request({
        method: 'POST',
        path: '/trades/orders/manual',
        token,
        body: {
          symbol: 'BTCUSDT',
          side: 'buy',
          orderType: 'market',
          quantity: 0.01,
          timeInForce: 'gtc',
        },
      })
    ).status,
    202,
  );
  expectStatus('trades.open', (await request({ method: 'GET', path: '/trades/open', token })).status, 200);
  expectStatus('trades.history', (await request({ method: 'GET', path: '/trades/history', token })).status, 200);

  expectStatus('notifications.list', (await request({ method: 'GET', path: '/notifications', token })).status, 200);
  expectStatus('notifications.unread', (await request({ method: 'GET', path: '/notifications/unread-count', token })).status, 200);
  expectStatus('notifications.readAll', (await request({ method: 'PATCH', path: '/notifications/read-all', token })).status, 200);

  expectStatus(
    'notifications.create.forbidden',
    (
      await request({
        method: 'POST',
        path: '/notifications',
        token,
        body: {
          userId,
          type: 'info',
          title: 'Should fail',
          message: 'Non-admin cannot create notifications',
        },
      })
    ).status,
    403,
  );

  expectStatus('admin.access.forbidden', (await request({ method: 'GET', path: '/admin/access-check', token })).status, 403);
  expectStatus(
    'admin.engineHealth.forbidden',
    (await request({ method: 'GET', path: '/admin/trading-engine/health', token })).status,
    403,
  );

  return results;
};

try {
  const summary = await run();
  console.log('SMOKE_RESULTS_START');
  console.log(JSON.stringify(summary, null, 2));
  console.log('SMOKE_RESULTS_END');
} catch (error) {
  console.error('SMOKE_FAILED');
  console.error(error?.stack ?? String(error));
  process.exitCode = 1;
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
