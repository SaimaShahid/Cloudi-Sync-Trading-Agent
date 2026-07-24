# Shareable Endpoints Reference

Use this file when handing endpoints to the frontend developer or the Python trading-engine developer.

## 1. What The Frontend Can Share/Use

The frontend should only call the backend. It must never call the Python trading engine directly.

### Public Backend Endpoints

- `GET /api/v1/health`
- `GET /api/v1/docs/openapi.json`
- `GET /api/v1/docs/catalog`

### Auth Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### User Endpoints

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Dashboard Endpoints

- `GET /api/v1/dashboard/summary`

### Portfolio Endpoints

- `GET /api/v1/portfolio/summary`
- `GET /api/v1/portfolio/holdings`

### Trade Endpoints

- `POST /api/v1/trades/orders/manual`
- `GET /api/v1/trades/open`
- `GET /api/v1/trades/history`

### Notification Endpoints

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/read-all`
- `PATCH /api/v1/notifications/:notificationId/read`

### Admin Endpoints

These are for admin users only.

- `GET /api/v1/admin/access-check`
- `GET /api/v1/admin/trading-engine/health`
- `GET /api/v1/users`
- `PATCH /api/v1/users/:userId/role`
- `POST /api/v1/notifications`

## 2. What The Frontend Should Also Know About WebSockets

Socket server is on the same backend host and port.

### Client Subscribe Events

- `dashboard:subscribe`
- `dashboard:unsubscribe`
- `portfolio:subscribe`
- `portfolio:unsubscribe`
- `trade:subscribe`
- `trade:unsubscribe`
- `notification:subscribe`
- `notification:unsubscribe`
- `system:ping`

### Server Events Frontend Listens For

- `system:ready`
- `dashboard:update`
- `portfolio:update`
- `trade:update`
- `notification:update`
- `system:error`

## 3. What The Python Engine Developer Should Implement

The backend calls these engine endpoints internally. Do not expose these to the frontend.

### Engine Health

- `GET /health`

### Engine Dashboard

- `GET /api/v1/dashboard/summary?userId=<id>`

### Engine Portfolio

- `GET /api/v1/portfolio/summary?userId=<id>`
- `GET /api/v1/portfolio/holdings?userId=<id>`

### Engine Trades

- `POST /api/v1/trades/orders/manual`
- `GET /api/v1/trades/open?userId=<id>`
- `GET /api/v1/trades/history?userId=<id>`

## 4. Response Rules To Keep Stable

1. Return JSON only.
2. Keep keys stable across releases.
3. Keep `/health` fast and lightweight.
4. Preserve backend response envelope shape for frontend APIs.
5. Do not let the frontend call the engine directly.

## 5. Quick Handoff Summary

- Frontend: use backend `/api/v1/*` endpoints only.
- Engine: implement the 7 backend-called engine endpoints above.
- Backend: remains the only gateway between frontend and engine.