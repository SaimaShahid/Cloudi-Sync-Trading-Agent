# Backend Build Plan

This folder contains the Node.js backend for the AI-powered cryptocurrency trading platform.

## Backend Role

The backend is the only gateway between:

- Frontend clients
- Python trading engine
- MongoDB and supporting infrastructure

The frontend must never communicate directly with the Python trading engine. All communication must pass through this backend via REST APIs or WebSocket channels.

## Architectural Direction

The backend will follow:

- Clean architecture principles
- Modular separation of concerns
- Thin controllers
- Service-driven business logic
- Repository-based data access
- Dedicated integration layer for external systems
- Centralized validation, authentication, and error handling

## Target Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Socket.IO
- dotenv
- express-validator
- Pino
- Helmet
- CORS
- express-rate-limit

## Planned Folder Structure

```text
backend/
  README.md
  package.json
  .env.example
  src/
    config/
    routes/
    controllers/
    services/
    repositories/
    models/
    middleware/
    validators/
    sockets/
    integrations/
      trading-engine/
      market-data/
    utils/
    docs/
```

## Delivery Phases

- [x] Phase 1: Project setup
- [x] Phase 1: Folder structure
- [x] Phase 1: Environment configuration
- [x] Phase 1: Database connection
- [x] Phase 1: Logger
- [x] Phase 1: Error handler
- [x] Phase 2: Authentication
- [ ] Phase 2: User management
- [ ] Phase 3: Dashboard APIs
- [ ] Phase 4: Portfolio APIs
- [ ] Phase 5: Trade APIs
- [ ] Phase 6: Trading engine integration layer
- [ ] Phase 7: WebSockets
- [ ] Phase 8: Notifications
- [ ] Phase 9: Security improvements
- [ ] Phase 10: API documentation

## Module-by-Module Rule

For each module we will follow this order:

1. Explain the purpose
2. Explain where it belongs in the architecture
3. Create the folder structure
4. Explain every folder
5. Explain every file
6. Explain the request flow
7. Explain communication with other modules
8. Explain best practices
9. Implement only that module

## Current Status

Phase 1 is complete.

## Phase 2 Module: Authentication

### 1. Purpose

The authentication module is responsible for:

- user registration
- user login
- issuing JWT access tokens
- protecting private API routes
- attaching the authenticated user context to incoming requests

This module answers the question: who is calling the backend, and are they allowed to access a protected resource?

### 2. Where It Belongs In The Architecture

Authentication sits across multiple layers:

- routes: expose auth endpoints
- controllers: receive requests and return responses
- validators: validate incoming credentials
- services: handle registration, password verification, and token issuance
- repositories: read and write user records
- models: define user persistence shape
- middleware: verify JWTs for protected routes
- utils: encapsulate token helpers and shared primitives

This keeps controllers thin and prevents database and security logic from leaking into route handlers.

### 3. Folder Structure For This Module

```text
src/
  routes/
    auth.routes.js
  controllers/
    auth.controller.js
  services/
    auth.service.js
  repositories/
    user.repository.js
  models/
    user.model.js
  middleware/
    auth.middleware.js
    validate.middleware.js
  validators/
    auth.validator.js
  utils/
    jwt.js
```

### 4. Folder Explanation

- routes: maps auth endpoints to controllers only
- controllers: converts HTTP input into service calls
- services: owns auth business rules
- repositories: isolates MongoDB queries
- models: defines the MongoDB user schema
- middleware: enforces token-based access control and request validation
- validators: keeps request validation separate from controllers
- utils: contains JWT helper functions shared by auth service and middleware

### 5. File Explanation

- auth.routes.js: defines register, login, and current-user endpoints
- auth.controller.js: thin handlers for auth requests
- auth.service.js: handles registration, password verification, JWT issuance, and authenticated-user lookup
- user.repository.js: creates users and queries users by email or id
- user.model.js: stores account information and hides password hashes from API responses
- auth.middleware.js: validates bearer tokens and loads the authenticated user
- validate.middleware.js: returns validation errors in a consistent format
- auth.validator.js: validates registration and login payloads
- jwt.js: signs and verifies JWT tokens

### 6. Request Flow

1. Client sends request to an auth route.
2. Route applies validators.
3. Validation middleware rejects malformed input early.
4. Controller calls auth service.
5. Auth service uses the user repository.
6. Repository interacts with the user model and MongoDB.
7. Auth service returns safe response data plus token when applicable.
8. Controller formats the response.
9. For protected routes, auth middleware verifies the JWT before the controller runs.

### 7. Communication With Other Modules

- dashboard, portfolio, trade, and notification modules will rely on auth middleware for protected access
- user-management features will reuse the user model and repository created here
- WebSocket authentication in a later phase can reuse the JWT helper strategy defined here
- the trading-engine integration layer should trust the backend user context, never direct frontend credentials

### 8. Best Practices

- never store plain-text passwords
- hash passwords with bcrypt before persistence
- never query the database inside controllers
- never sign tokens inside routes directly
- normalize auth errors so credential failures do not leak sensitive details
- return only safe user fields to clients
- validate all auth input before business logic runs
- keep JWT verification centralized in middleware

### 9. Implementation Status

Authentication implementation is complete in this backend module.

Next module after this: user management.
