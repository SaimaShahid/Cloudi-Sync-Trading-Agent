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
- [x] Phase 2: User management
- [x] Phase 3: Dashboard APIs
- [x] Phase 4: Portfolio APIs
- [x] Phase 5: Trade APIs
- [x] Phase 6: Trading engine integration layer
- [x] Phase 7: WebSockets
- [x] Phase 8: Notifications
- [x] Phase 9: Security improvements
- [x] Phase 10: API documentation

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

Team handoff and self-testing guide: [INTEGRATION_TESTING_GUIDE.md](INTEGRATION_TESTING_GUIDE.md)

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

## Phase 2 Step 2: Role Strategy And Authorization Boundary

### 1. Purpose

This step is responsible for:

- defining the allowed user roles in one place
- enforcing role-based access control for protected routes
- preparing the backend for admin-only operations in later modules

Authentication tells us who the caller is. Authorization tells us what that caller is allowed to do.

### 2. Where It Belongs In The Architecture

This belongs across:

- models: user roles must be constrained at the persistence layer
- middleware: authorization must run before protected controllers
- utils: role constants should be centralized and reusable
- routes: protected endpoints compose auth and authorization middleware
- controllers and services: should assume authorization has already been enforced upstream

This keeps permission checks out of controllers and prevents duplicated inline role logic.

### 3. Folder Structure For This Step

```text
src/
  middleware/
    authorization.middleware.js
  utils/
    roles.js
  routes/
    admin.routes.js
  controllers/
    admin.controller.js
  services/
    admin.service.js
```

### 4. Folder Explanation

- middleware: contains the reusable route guard for role enforcement
- utils: holds shared role constants and role membership helpers
- routes: exposes admin-only endpoints without embedding security logic
- controllers: stays thin even for protected admin endpoints
- services: returns admin-scoped data or actions while assuming security has already been checked

### 5. File Explanation

- authorization.middleware.js: blocks requests whose authenticated user lacks the required role
- roles.js: defines supported roles and helper functions used by models and middleware
- admin.routes.js: demonstrates how future admin modules should compose requireAuth and requireRole
- admin.controller.js: thin HTTP adapter for the admin access check endpoint
- admin.service.js: returns a minimal admin access payload used to validate the boundary

### 6. Request Flow

1. Client sends request to an admin-protected route.
2. JWT authentication runs first and attaches the user to the request.
3. Authorization middleware checks that the user's role matches the allowed roles.
4. If the role is not allowed, the request fails before reaching the controller.
5. If authorized, the controller calls the service.
6. The service returns the admin-safe payload.
7. The controller formats the response consistently.

### 7. Communication With Other Modules

- future user-management endpoints can restrict role changes to admins only
- dashboard, portfolio, trade, and notification modules can protect sensitive operations with the same middleware
- WebSocket channel authorization can reuse the same role helper strategy in a later phase
- trading-engine control endpoints should use this boundary for dangerous operations like bot start, stop, override, or forced liquidation workflows

### 8. Best Practices

- define roles once and reuse them everywhere
- authorize at the route boundary, not inside controllers
- fail closed when no role matches
- keep admin-only routes explicit and easy to audit
- never trust a frontend role claim without verifying the backend token and backend user state

### 9. Implementation Status

Role strategy and admin-ready authorization boundaries are implemented.

## Phase 2 Module: User Management

### 1. Purpose

The user management module is responsible for:

- returning the authenticated user's profile
- allowing users to update their own basic profile details
- allowing admins to list platform users
- allowing admins to change user roles

This module answers the question: once a user is authenticated, how is their account data managed safely?

### 2. Where It Belongs In The Architecture

User management spans these layers:

- routes: define user-facing and admin-facing user endpoints
- controllers: translate HTTP input into service calls
- validators: ensure profile and role update payloads are safe
- services: enforce user-management business rules
- repositories: isolate database reads and writes for users
- middleware: reuse authentication and authorization boundaries already implemented

This keeps profile and admin account logic out of the authentication module while still reusing the same user persistence model.

### 3. Folder Structure For This Module

```text
src/
  routes/
    user.routes.js
  controllers/
    user.controller.js
  services/
    user.service.js
  repositories/
    user.repository.js
  validators/
    user.validator.js
```

### 4. Folder Explanation

- routes: exposes current-user and admin user-management endpoints
- controllers: remains thin and delegates profile and admin account actions to services
- services: owns business rules like allowed profile fields and role-change checks
- repositories: performs user lookups, lists, and updates against MongoDB
- validators: ensures update payloads are valid before services run

### 5. File Explanation

- user.routes.js: defines profile endpoints and admin user-management endpoints
- user.controller.js: thin handlers for profile fetch, profile update, user listing, and role update
- user.service.js: enforces ownership, uniqueness, and role-change rules
- user.repository.js: now also supports listing users and updating user records
- user.validator.js: validates profile updates and admin role changes

### 6. Request Flow

1. Client calls a user-management endpoint.
2. Authentication middleware verifies the JWT.
3. If the endpoint is admin-only, authorization middleware verifies the role.
4. Validators check payload shape and field constraints.
5. Controller calls the user service.
6. User service enforces business rules and delegates persistence to the repository.
7. Repository interacts with MongoDB through the user model.
8. Controller returns a consistent response payload.

### 7. Communication With Other Modules

- authentication reuses the same user model and repository boundary
- authorization middleware protects admin-only user-management endpoints
- dashboard and portfolio modules can later rely on current user profile data from this layer
- notification and audit features can later hook into user changes such as role updates

### 8. Best Practices

- separate profile updates from security-sensitive auth flows
- allow only explicit, whitelisted profile fields to be updated
- validate email uniqueness before profile writes
- keep role changes admin-only and centralized
- never expose password hashes or internal persistence fields

### 9. Implementation Status

User management implementation is included in this backend module.

## Phase 3 Module: Dashboard APIs

### 1. Purpose

The dashboard module is responsible for:

- providing a single authenticated summary endpoint for the frontend dashboard
- aggregating high-level backend-facing trading information into one response shape
- exposing a stable contract before the Python trading-engine integration is implemented

This module answers the question: what single API should the frontend call to render the main dashboard screen?

### 2. Where It Belongs In The Architecture

Dashboard APIs span these layers:

- routes: expose dashboard endpoints only
- controllers: receive authenticated requests and delegate immediately
- services: compose the dashboard response shape
- integrations: will later supply live trading and market data, but are not implemented yet in this phase

This keeps the dashboard contract stable while deferring live engine communication to the dedicated integration phase.

### 3. Folder Structure For This Module

```text
src/
  routes/
    dashboard.routes.js
  controllers/
    dashboard.controller.js
  services/
    dashboard.service.js
```

### 4. Folder Explanation

- routes: maps dashboard endpoints to controllers and applies authentication
- controllers: stays thin and translates service output into HTTP responses
- services: builds the dashboard summary payload and defines the initial API contract

### 5. File Explanation

- dashboard.routes.js: defines the authenticated dashboard summary endpoint
- dashboard.controller.js: thin handler for dashboard requests
- dashboard.service.js: returns the dashboard summary payload with explicit placeholders for future integration-driven fields

### 6. Request Flow

1. Frontend calls the dashboard summary endpoint.
2. Authentication middleware verifies the JWT and attaches the user context.
3. Controller calls the dashboard service.
4. Dashboard service builds the summary response.
5. Controller returns the standardized success payload.
6. In a later phase, the same service will delegate data gathering to the trading-engine and market-data integrations.

### 7. Communication With Other Modules

- authentication protects the dashboard route
- user management provides the user identity context already attached by auth middleware
- trading-engine integration will later supply bot status, signal summaries, and PnL snapshots
- market-data integration will later supply live prices and market movement summaries
- WebSockets will later complement this module with realtime dashboard updates

### 8. Best Practices

- design the dashboard as a composition endpoint, not as a place for scattered frontend fetches
- keep the response shape stable even when live integrations are introduced later
- distinguish clearly between real data and integration-pending placeholders
- keep controllers thin and avoid embedding aggregation logic in routes

### 9. Implementation Status

Dashboard APIs are implemented with an authenticated summary endpoint and an integration-ready response contract.

## Phase 4 Module: Portfolio APIs

### 1. Purpose

The portfolio module is responsible for:

- returning a portfolio summary for the authenticated user
- returning the user's holdings list
- defining the response contract that later phases will populate from live trading and market sources

This module answers the question: what portfolio data should the frontend use to render account value, asset allocation, and holdings?

### 2. Where It Belongs In The Architecture

Portfolio APIs span these layers:

- routes: expose portfolio endpoints only
- controllers: receive authenticated requests and delegate immediately
- services: compose portfolio response shapes and backend-level portfolio rules
- integrations: will later supply balances, positions, valuations, and historical metrics

This keeps portfolio contracts stable while deferring live engine and market connectivity to the dedicated integration phase.

### 3. Folder Structure For This Module

```text
src/
  routes/
    portfolio.routes.js
  controllers/
    portfolio.controller.js
  services/
    portfolio.service.js
```

### 4. Folder Explanation

- routes: maps portfolio endpoints to controllers and applies authentication
- controllers: keeps HTTP handling thin and delegates all portfolio composition work
- services: builds portfolio summary and holdings payloads with integration-ready sections

### 5. File Explanation

- portfolio.routes.js: defines authenticated portfolio summary and holdings endpoints
- portfolio.controller.js: thin handlers for portfolio requests
- portfolio.service.js: returns portfolio summary and holdings payloads with explicit placeholders for future live data

### 6. Request Flow

1. Frontend calls a portfolio endpoint.
2. Authentication middleware verifies the JWT and attaches the user context.
3. Controller calls the portfolio service.
4. Portfolio service builds the response contract.
5. Controller returns the standardized success payload.
6. In a later phase, the same service will delegate to trading-engine and market-data integrations for real balances and valuations.

### 7. Communication With Other Modules

- authentication protects portfolio access
- user management provides the user identity context that scopes portfolio requests
- dashboard can later reuse portfolio summary slices instead of duplicating balance logic
- trading-engine integration will later supply positions, balances, and execution-derived portfolio state
- market-data integration will later supply valuation and price-change context for holdings

### 8. Best Practices

- define portfolio summary and holdings as separate endpoints to keep payloads focused
- keep response contracts stable while integration layers are still pending
- distinguish clearly between asset quantity and market valuation
- avoid putting market-pricing logic inside controllers

### 9. Implementation Status

Portfolio APIs are implemented with authenticated summary and holdings endpoints and integration-ready placeholder contracts.

## Phase 5 Module: Trade APIs

### 1. Purpose

The trade module is responsible for:

- accepting manual trade order requests from the frontend
- exposing authenticated open-trade and trade-history endpoints
- defining the backend contract that will later be connected to the Python trading engine

This module answers the question: how should the frontend submit trades and read trade state without ever talking directly to the trading engine?

### 2. Where It Belongs In The Architecture

Trade APIs span these layers:

- routes: expose trade endpoints only
- controllers: receive authenticated requests and delegate immediately
- validators: validate trade order payloads before business logic runs
- services: normalize manual order requests and compose open-trade and history responses
- integrations: will later execute orders and fetch trade state from the trading engine

This keeps trade contracts stable now while preserving the rule that all engine communication must pass through a dedicated backend layer in Phase 6.

### 3. Folder Structure For This Module

```text
src/
  routes/
    trade.routes.js
  controllers/
    trade.controller.js
  services/
    trade.service.js
  validators/
    trade.validator.js
  utils/
    trade.js
```

### 4. Folder Explanation

- routes: maps trade endpoints to controllers and applies authentication
- controllers: keeps HTTP handling thin and delegates trade logic to services
- services: builds manual-order acceptance payloads plus open-trade and trade-history contracts
- validators: enforces safe order payload structure before service execution
- utils: centralizes trade enums and shared contract constants

### 5. File Explanation

- trade.routes.js: defines authenticated manual order, open-trade, and history endpoints
- trade.controller.js: thin handlers for trade requests
- trade.service.js: returns integration-ready trade payloads and request-acceptance contracts
- trade.validator.js: validates manual trade order input with conditional rules for order types
- trade.js: centralizes allowed trade sides, order types, and time-in-force values

### 6. Request Flow

1. Frontend sends a trade request or reads trade state through the backend.
2. Authentication middleware verifies the JWT and attaches the user context.
3. For order submission, validation middleware checks symbol, side, quantity, order type, and conditional price fields.
4. Controller calls the trade service.
5. Trade service normalizes the request and returns a backend acceptance contract.
6. In Phase 6, the same service boundary will delegate actual execution and trade retrieval to the trading-engine integration.
7. Controller returns the standardized success payload.

### 7. Communication With Other Modules

- authentication protects all trade endpoints
- dashboard can later reuse trade summary slices for open positions and recent activity
- portfolio can later reuse execution results to reflect holdings and PnL changes
- trading-engine integration will later consume manual order requests and provide live trade state
- WebSockets will later stream trade execution updates to the frontend

### 8. Best Practices

- validate trade payloads strictly at the request boundary
- keep manual order acceptance separate from actual execution status
- treat the backend as the single authority for trade submission contracts
- avoid mixing engine-specific transport details into controllers or frontend-facing routes
- keep response contracts explicit about pending integration versus executed state

### 9. Implementation Status

Trade APIs are implemented with authenticated manual order submission, open-trade, and trade-history endpoints using integration-ready contracts.

## Phase 6 Module: Trading Engine Integration Layer

### 1. Purpose

The trading engine integration layer is responsible for:

- isolating all backend-to-Python communication behind a dedicated client
- adapting frontend-facing Node.js contracts to engine-facing request and response payloads
- letting existing dashboard, portfolio, and trade services fetch live engine data without leaking Python concerns into controllers

This module answers the question: how does the backend talk to the Python trading engine while still remaining the only gateway for the frontend?

### 2. Where It Belongs In The Architecture

This module belongs under:

- integrations/trading-engine: owns all outbound communication to the Python engine
- services: call the integration layer instead of constructing HTTP requests themselves
- config: provides base URL, timeouts, and auth settings for the integration client
- admin-facing routes and services: can expose connectivity state without exposing engine internals to the frontend

This keeps external communication centralized, testable, and replaceable.

### 3. Folder Structure For This Module

```text
src/
  integrations/
    trading-engine/
      trading-engine.client.js
      trading-engine.mapper.js
  services/
    dashboard.service.js
    portfolio.service.js
    trade.service.js
  routes/
    admin.routes.js
  controllers/
    admin.controller.js
  services/
    admin.service.js
```

### 4. Folder Explanation

- integrations/trading-engine: contains the only code that knows how to call Python endpoints
- services: compose backend responses using mapped engine data instead of direct transport logic
- routes/controllers/admin service: expose a safe backend-level connectivity check for the engine

### 5. File Explanation

- trading-engine.client.js: low-level HTTP client for the Python engine with timeout, auth-header support, and safe availability handling
- trading-engine.mapper.js: adapts raw engine responses into backend-facing dashboard, portfolio, and trade contracts
- dashboard.service.js: now attempts to fetch live engine summary data through the integration client
- portfolio.service.js: now attempts to fetch live engine portfolio data through the integration client
- trade.service.js: now attempts to submit manual orders and retrieve open trades/history through the integration client
- admin.routes.js, admin.controller.js, admin.service.js: now include a backend-side engine health endpoint for operational visibility

### 6. Request Flow

1. Frontend calls a backend endpoint such as dashboard, portfolio, or trades.
2. Authentication and authorization run inside the backend as needed.
3. Controller calls the relevant service.
4. Service calls the trading-engine integration client.
5. The client sends a backend-owned HTTP request to the Python engine.
6. The mapper normalizes the raw engine response into the backend contract.
7. The service returns the mapped result or a safe fallback when the engine is disabled or unavailable.
8. Controller returns the standardized backend response to the frontend.

### 7. Communication With Other Modules

- dashboard, portfolio, and trade services now depend on the integration layer instead of static placeholders alone
- admin routes can use the integration health endpoint to expose backend-controlled operational status
- future WebSocket and notification modules can reuse the same integration client and mapping approach for live engine events

### 8. Best Practices

- keep all Python transport details inside the integration folder
- map engine payloads into backend contracts before returning them to the frontend
- fail safely when the engine is disabled or unavailable
- never let the frontend call the Python engine directly, even for health checks
- keep service boundaries stable so later engine changes do not ripple into routes and controllers

### 9. Implementation Status

Trading engine integration is implemented with a dedicated client, response mappers, a backend-side health check, and first live-wired dashboard, portfolio, and trade service calls with graceful fallback behavior.

## Phase 7 Module: WebSockets

### 1. Purpose

The WebSocket module is responsible for:

- providing authenticated realtime channels for frontend clients
- allowing user-scoped subscriptions for dashboard, portfolio, and trade updates
- exposing a broadcaster boundary so services can emit events without depending on socket internals

This module answers the question: how does the backend push realtime updates to the frontend while keeping identity and authorization under backend control?

### 2. Where It Belongs In The Architecture

This module belongs across:

- sockets: owns Socket.IO server, auth middleware, event names, room naming, and handlers
- server bootstrap: initializes Socket.IO on the existing HTTP server
- services: publish updates through a broadcaster abstraction instead of direct Socket.IO usage

This keeps realtime transport concerns isolated from controllers and route code.

### 3. Folder Structure For This Module

```text
src/
  sockets/
    socket-server.js
    socket-auth.js
    socket-handlers.js
    socket-broadcaster.js
    socket-events.js
    socket-room.js
  services/
    dashboard.service.js
    portfolio.service.js
    trade.service.js
  server.js
```

### 4. Folder Explanation

- sockets: complete realtime transport layer and channel orchestration
- services: emit domain updates through broadcaster helpers
- server.js: attaches Socket.IO runtime to the backend HTTP server

### 5. File Explanation

- socket-server.js: initializes Socket.IO with CORS, auth middleware, and connection lifecycle logging
- socket-auth.js: validates JWT from socket handshake and loads backend user context
- socket-handlers.js: handles subscribe and unsubscribe events for dashboard, portfolio, and trade streams
- socket-broadcaster.js: provides service-safe emit helpers for user-scoped and channel-scoped events
- socket-events.js: centralizes socket event names
- socket-room.js: centralizes room naming conventions
- dashboard.service.js, portfolio.service.js, trade.service.js: now emit update events after generating payloads
- server.js: initializes the socket server during backend startup

### 6. Request Flow

1. Frontend opens a Socket.IO connection with a backend JWT.
2. Socket auth middleware verifies the token and loads the authenticated user.
3. Connection handlers place the socket in a user-specific room.
4. Frontend subscribes to dashboard, portfolio, or trade channels.
5. Services emit updates via broadcaster helpers.
6. Broadcaster routes events to user and channel rooms.
7. Frontend receives realtime backend events without contacting the Python engine directly.

### 7. Communication With Other Modules

- authentication logic is reused for socket handshake identity validation
- dashboard, portfolio, and trade services now publish realtime payloads through broadcaster helpers
- trading-engine integration can later push live execution and strategy events through the same broadcaster boundary
- notification module can later reuse socket delivery channels for realtime alerts

### 8. Best Practices

- authenticate every socket connection with backend JWT validation
- keep event names and room naming centralized
- emit from services through broadcaster helpers, not directly in controllers
- keep user-scoped room boundaries strict to prevent cross-user data leakage
- isolate transport logic under src/sockets so domain services remain testable

### 9. Implementation Status

WebSockets are implemented with authenticated Socket.IO connections, channel subscriptions, and service-level event broadcasting for dashboard, portfolio, and trade updates.

## Phase 8 Module: Notifications

### 1. Purpose

The notifications module is responsible for:

- storing user notifications in MongoDB
- exposing authenticated APIs to list notifications and manage read state
- allowing admins to create notifications for users
- delivering realtime notification events over WebSockets

This module answers the question: how do users receive and manage platform events consistently across REST and realtime channels?

### 2. Where It Belongs In The Architecture

This module spans:

- models: notification persistence schema
- repositories: notification database access
- services: notification business logic and socket emission orchestration
- validators: payload and query validation
- controllers: thin HTTP adapters
- routes: endpoint definitions and middleware composition
- sockets: notification channel subscription and broadcasting

This keeps notification persistence, delivery, and API behavior modular and testable.

### 3. Folder Structure For This Module

```text
src/
  models/
    notification.model.js
  repositories/
    notification.repository.js
  services/
    notification.service.js
  controllers/
    notification.controller.js
  validators/
    notification.validator.js
  routes/
    notification.routes.js
  utils/
    notification.js
  sockets/
    socket-events.js
    socket-room.js
    socket-handlers.js
    socket-broadcaster.js
```

### 4. Folder Explanation

- models: defines notification storage contract in MongoDB
- repositories: encapsulates queries for listing, counting unread, and read-state updates
- services: applies notification rules and emits realtime events
- controllers: keeps notification request handlers thin
- validators: validates list query parameters and admin notification payloads
- routes: binds routes to middleware, validators, and controllers
- utils: central notification enum values
- sockets: adds notification subscription rooms and broadcast events

### 5. File Explanation

- notification.model.js: notification schema with user scope, type, content, metadata, and read timestamp
- notification.repository.js: create/list/count/mark-read repository functions
- notification.service.js: orchestrates repository actions and socket broadcast payloads
- notification.controller.js: thin adapters for list, unread count, mark read, mark all read, and admin create
- notification.validator.js: validates query and payload contracts
- notification.routes.js: defines authenticated notification APIs and admin-only create route
- notification.js: central notification type constants
- socket-events.js, socket-room.js, socket-handlers.js, socket-broadcaster.js: notification realtime channel support

### 6. Request Flow

1. Frontend calls a notification endpoint.
2. Authentication middleware verifies JWT and attaches user context.
3. Optional validators verify query params or payload structure.
4. Controller delegates to notification service.
5. Service performs repository operations against MongoDB.
6. Service emits notification channel updates through broadcaster helpers when state changes.
7. Controller returns standardized HTTP response.
8. Subscribed sockets receive realtime notification updates in user-scoped rooms.

### 7. Communication With Other Modules

- authentication secures all notification routes
- authorization restricts notification creation to admins
- sockets module provides realtime delivery channels
- dashboard, portfolio, and trade modules can later create domain notifications through notification service boundaries
- trading engine integration can later map engine events into persisted notifications

### 8. Best Practices

- persist notifications before broadcasting realtime updates
- scope all notification queries by authenticated user identity
- keep read-state mutations explicit and auditable
- centralize notification type enums for consistency across APIs and sockets
- separate admin notification creation from user read-state actions

### 9. Implementation Status

Notifications are implemented with MongoDB persistence, authenticated REST endpoints, admin creation, and realtime socket delivery.

## Phase 9 Module: Security Improvements

### 1. Purpose

The security improvements module is responsible for:

- reducing brute-force risk on authentication endpoints
- enforcing stronger JWT signing and verification guarantees
- protecting production transport expectations behind proxy-aware HTTPS enforcement
- reducing sensitive-data leakage in logs
- tightening production CORS behavior

This module answers the question: how do we harden backend runtime behavior for production without breaking clean architecture boundaries?

### 2. Where It Belongs In The Architecture

This module spans:

- config: secure environment-driven settings
- middleware: auth rate limiting and HTTPS transport enforcement
- routes: composition of stricter auth protections
- utils: JWT signing and verification hardening
- app bootstrap: proxy and header hardening behavior
- logging: centralized sensitive-data redaction

This keeps security concerns centralized and reusable rather than scattered across controllers.

### 3. Folder Structure For This Module

```text
src/
  config/
    env.js
    logger.js
  middleware/
    auth-rate-limit.middleware.js
    security.middleware.js
  routes/
    auth.routes.js
  utils/
    jwt.js
  app.js
  .env.example
```

### 4. Folder Explanation

- config: defines and enforces secure runtime settings
- middleware: request-level security controls
- routes: applies stronger endpoint-level protections
- utils: encapsulates cryptographic token behavior
- app.js: central security bootstrapping for headers, proxy, and HTTPS behavior
- env example: documents required and optional security configuration inputs

### 5. File Explanation

- env.js: parses security flags and enforces explicit CORS origin in production
- logger.js: redacts secrets such as tokens, passwords, and auth headers
- auth-rate-limit.middleware.js: applies stricter authentication request throttling
- security.middleware.js: enforces HTTPS for production when enabled
- auth.routes.js: composes auth rate limiting for register and login routes
- jwt.js: enforces algorithm, issuer, and audience for signing and verification
- app.js: applies proxy trust, secure header policy, and transport enforcement middleware
- .env.example: documents JWT claims, proxy, HTTPS, and auth-throttle settings

### 6. Request Flow

1. Request enters app-level security middleware and headers are applied.
2. Production HTTPS enforcement blocks insecure transport when configured.
3. CORS policy is applied with environment-driven restrictions.
4. Auth endpoints apply dedicated auth-rate limiting before validation and controller execution.
5. JWT verification enforces algorithm, issuer, and audience constraints.
6. Any security failures are routed into centralized error middleware.
7. Logs are emitted with sensitive fields redacted.

### 7. Communication With Other Modules

- authentication now relies on stricter JWT claim enforcement
- websockets reuse the hardened JWT verification path through shared utility functions
- all modules benefit from app-level secure headers and transport checks
- centralized logger redaction protects data across every module without code duplication

### 8. Best Practices

- enforce cryptographic token constraints, not just token presence
- separate general API throttling from stricter auth-specific throttling
- enforce secure transport in production behind trusted proxies
- never log raw credentials, tokens, or password hashes
- keep security settings environment-driven and explicit

### 9. Implementation Status

Security improvements are implemented with auth throttling, strict JWT claims, production HTTPS enforcement, production-safe CORS enforcement, and centralized sensitive-data log redaction.

## Phase 10 Module: API Documentation

### 1. Purpose

The API documentation module is responsible for:

- defining an OpenAPI source-of-truth for the backend REST contract
- exposing backend endpoints that serve documentation artifacts
- providing a machine-readable catalog for frontend, QA, and integration teams

This module answers the question: how do we keep API contracts explicit, discoverable, and consumable across teams?

### 2. Where It Belongs In The Architecture

This module spans:

- docs: stores documentation assets (OpenAPI JSON)
- services: reads and transforms documentation assets
- controllers: thin delivery layer for docs payloads
- routes: documentation endpoints exposed under API version namespace
- route composition: docs route integrated into the central route index

This keeps docs delivery separate from feature modules while still serving contracts through the backend gateway.

### 3. Folder Structure For This Module

```text
src/
  docs/
    openapi.json
    README.md
  services/
    docs.service.js
  controllers/
    docs.controller.js
  routes/
    docs.routes.js
    index.js
```

### 4. Folder Explanation

- docs: canonical API contract artifacts and documentation notes
- services: OpenAPI loading and endpoint-catalog generation logic
- controllers: thin adapters that return docs payloads in standardized API response shape
- routes: maps docs endpoints to controllers and keeps route wiring isolated

### 5. File Explanation

- openapi.json: OpenAPI 3.0 specification covering health, auth, admin, users, dashboard, portfolio, trades, notifications, and docs endpoints
- docs README: explains documentation artifacts and exposed docs endpoints
- docs.service.js: loads and parses OpenAPI JSON and derives a compact endpoint catalog
- docs.controller.js: returns spec and catalog through standard response format
- docs.routes.js: defines docs endpoints
- routes index: mounts docs routes under /api/v1/docs

### 6. Request Flow

1. Client or tooling calls a docs endpoint.
2. Docs route maps request to docs controller.
3. Docs controller delegates to docs service.
4. Docs service reads and parses OpenAPI JSON from docs assets.
5. For catalog requests, service derives endpoint metadata from the OpenAPI paths.
6. Controller returns standardized success response.

### 7. Communication With Other Modules

- every REST module contributes endpoints represented in OpenAPI paths
- frontend can generate client types and request helpers from OpenAPI
- QA and automation pipelines can validate endpoint contracts against docs output
- future API changes should update docs artifacts alongside route/service changes

### 8. Best Practices

- keep OpenAPI as the contract source-of-truth, not an afterthought
- update documentation in the same pull request as endpoint changes
- keep docs endpoints simple and side-effect free
- preserve stable operation identifiers for client generation

### 9. Implementation Status

API documentation is implemented with an OpenAPI 3.0 spec, backend docs endpoints, and a generated API catalog view.

Current roadmap status: Phase 1 through Phase 10 are complete.
