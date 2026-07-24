# Frontend Handoff

Share this file with the frontend developer.

## Base URL

`http://localhost:3000/api/v1`

## Authentication

All protected endpoints require:

`Authorization: Bearer <jwt>`

## Endpoint List To Share

### Health And Docs

- `GET /health`
- `GET /docs/openapi.json`
- `GET /docs/catalog`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users/me`
- `PATCH /users/me`

### Dashboard

- `GET /dashboard/summary`

### Portfolio

- `GET /portfolio/summary`
- `GET /portfolio/holdings`

### Trades

- `POST /trades/orders/manual`
- `GET /trades/open`
- `GET /trades/history`

### Notifications

- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/read-all`
- `PATCH /notifications/:notificationId/read`

### Admin Only

Hide these from normal users:

- `GET /admin/access-check`
- `GET /admin/trading-engine/health`
- `GET /users`
- `PATCH /users/:userId/role`
- `POST /notifications`

## Request Bodies

### Register

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Login

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Update My Profile

```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

### Manual Trade Order

```json
{
  "symbol": "BTCUSDT",
  "side": "buy",
  "orderType": "market",
  "quantity": 0.01,
  "timeInForce": "gtc",
  "note": "optional note"
}
```

### Create Notification (Admin Only)

```json
{
  "userId": "<mongo_user_id>",
  "type": "info",
  "title": "Test Notification",
  "message": "This is a test notification"
}
```

## WebSocket Events

### Subscribe Events Sent By Frontend

- `dashboard:subscribe`
- `dashboard:unsubscribe`
- `portfolio:subscribe`
- `portfolio:unsubscribe`
- `trade:subscribe`
- `trade:unsubscribe`
- `notification:subscribe`
- `notification:unsubscribe`

### Events Received From Backend

- `system:ready`
- `dashboard:update`
- `portfolio:update`
- `trade:update`
- `notification:update`
- `system:error`

## Frontend Integration Rules

1. Call backend only.
2. Store JWT after login and send it in the Authorization header.
3. Use Socket.IO only after login.
4. Do not call the Python trading engine directly.
5. Use `openapi.json` if you need exact schema details.