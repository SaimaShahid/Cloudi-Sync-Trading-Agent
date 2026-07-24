# Backend Integration And Testing Guide

This guide is for three audiences:

1. Backend owner (you) for self-testing.
2. Frontend developer for API and WebSocket integration.
3. Python trading-engine developer for backend-to-engine integration.

## 1. Quick Self-Testing (Backend Owner)

### 1.1 Prerequisites

1. Ensure `.env` is present and complete in [backend/.env](backend/.env).
2. Ensure MongoDB Atlas allows your current IP in Network Access.
3. Ensure username/password in `MONGODB_URI` are correct.
4. Install dependencies:

```powershell
cd backend
npm install
```

### 1.2 Static and Bootstrap Checks

Run this first:

```powershell
npm run check
```

Expected: `App bootstrap check passed`.

### 1.3 Runtime Smoke Test (All Modules)

Run:

```powershell
node scripts/smoke-test.mjs
```

Expected:

1. Output contains `SMOKE_RESULTS_START` and `SMOKE_RESULTS_END`.
2. All checks in the JSON array show `"ok": true`.

### 1.4 If Atlas SRV Fails Intermittently

If you see `querySrv ECONNREFUSED`, run the smoke test with a direct seed-list URI for this session only:

```powershell
$env:MONGODB_URI='mongodb://<username>:<password>@ac-<cluster>-shard-00-00.<host>.mongodb.net:27017,ac-<cluster>-shard-00-01.<host>.mongodb.net:27017,ac-<cluster>-shard-00-02.<host>.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority'
node scripts/smoke-test.mjs
```

### 1.5 Start Backend For Manual Testing

```powershell
npm run dev
```

Base URL:

`http://localhost:3000/api/v1`

## 2. What To Tell Frontend Developer

### 2.1 Golden Rules

1. Frontend must never call the Python engine directly.
2. Frontend calls backend only.
3. All authenticated endpoints require `Authorization: Bearer <jwt>`.

### 2.2 API Base And Response Envelope

Base URL:

`http://localhost:3000/api/v1`

Successful response shape:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error response shape:

```json
{
  "success": false,
  "message": "...",
  "error": {
    "code": "...",
    "details": {}
  }
}
```

### 2.3 API Surface To Integrate

Health and docs:

1. `GET /health`
2. `GET /docs/openapi.json`
3. `GET /docs/catalog`

Auth:

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /auth/me`

Users:

1. `GET /users/me`
2. `PATCH /users/me`

Dashboard:

1. `GET /dashboard/summary`

Portfolio:

1. `GET /portfolio/summary`
2. `GET /portfolio/holdings`

Trades:

1. `POST /trades/orders/manual`
2. `GET /trades/open`
3. `GET /trades/history`

Notifications:

1. `GET /notifications`
2. `GET /notifications/unread-count`
3. `PATCH /notifications/read-all`
4. `PATCH /notifications/:notificationId/read`

Admin-only endpoints are not for normal users and should be hidden in standard UI.

### 2.4 WebSocket Integration Contract

Socket server uses the same backend host/port.

Handshake auth:

```js
const socket = io('http://localhost:3000', {
  auth: { token: jwt }
});
```

Subscribe events frontend emits:

1. `dashboard:subscribe`
2. `portfolio:subscribe`
3. `trade:subscribe`
4. `notification:subscribe`

Realtime events frontend listens for:

1. `system:ready`
2. `dashboard:update`
3. `portfolio:update`
4. `trade:update`
5. `notification:update`

### 2.5 Frontend Dev Handoff Message

Use this exact handoff:

1. Integrate only with backend `http://localhost:3000/api/v1`.
2. Use JWT bearer auth after login.
3. Use [backend/src/docs/openapi.json](backend/src/docs/openapi.json) as API contract source.
4. Use Socket.IO with JWT in handshake and subscribe to dashboard, portfolio, trade, and notification channels.
5. Do not call any Python engine URL from frontend code.

## 3. What To Tell Python Engine Developer

### 3.1 Golden Rules

1. Engine is backend-internal, not public to frontend.
2. Backend calls engine through a dedicated integration client.
3. Engine should expose stable JSON contracts and fast health checks.

### 3.2 Endpoints Backend Calls On Engine

The backend client currently calls these engine paths:

1. `GET /health`
2. `GET /api/v1/dashboard/summary?userId=<id>`
3. `GET /api/v1/portfolio/summary?userId=<id>`
4. `GET /api/v1/portfolio/holdings?userId=<id>`
5. `POST /api/v1/trades/orders/manual`
6. `GET /api/v1/trades/open?userId=<id>`
7. `GET /api/v1/trades/history?userId=<id>`

Reference implementation: [backend/src/integrations/trading-engine/trading-engine.client.js](backend/src/integrations/trading-engine/trading-engine.client.js)

### 3.3 Request Expectations For Manual Order Endpoint

Backend sends:

```json
{
  "userId": "<string>",
  "userRole": "user|admin",
  "order": {
    "symbol": "BTCUSDT",
    "side": "buy|sell",
    "orderType": "market|limit|stop_limit",
    "quantity": 0.01,
    "price": null,
    "stopPrice": null,
    "timeInForce": "gtc|ioc|fok",
    "note": null
  }
}
```

### 3.4 Headers Engine Should Handle

Backend sends:

1. `X-Backend-Source: cloudi-sync-backend`
2. `Content-Type: application/json`
3. Optional `Authorization: Bearer <TRADING_ENGINE_API_KEY>` when configured

### 3.5 Engine Dev Handoff Message

Use this exact handoff:

1. Implement the 7 engine endpoints listed in Section 3.2.
2. Keep JSON response keys stable and always return parseable JSON.
3. Keep `/health` lightweight and quick.
4. Accept backend auth header if API key is enabled.
5. Do not expose engine directly to frontend; backend remains the only gateway.

## 4. Suggested Integration Sequence

1. Backend up with `npm run dev`.
2. Frontend integrates auth and profile first.
3. Frontend integrates dashboard, portfolio, and trade reads.
4. Frontend integrates manual trade submission.
5. Frontend integrates notifications and WebSocket channels.
6. Engine dev provides `/health`, then trade endpoints, then dashboard and portfolio.
7. Backend validates with `node scripts/smoke-test.mjs` after each major merge.

## 5. Useful Backend Files

1. API contract: [backend/src/docs/openapi.json](backend/src/docs/openapi.json)
2. Smoke test: [backend/scripts/smoke-test.mjs](backend/scripts/smoke-test.mjs)
3. Engine client: [backend/src/integrations/trading-engine/trading-engine.client.js](backend/src/integrations/trading-engine/trading-engine.client.js)
4. Socket events: [backend/src/sockets/socket-events.js](backend/src/sockets/socket-events.js)
5. Main plan: [backend/README.md](backend/README.md)