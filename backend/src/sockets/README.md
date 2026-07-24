# Sockets

This folder contains Socket.IO runtime modules.

- socket-server.js: initializes Socket.IO and connection middleware
- socket-auth.js: authenticates socket handshakes with backend JWT validation
- socket-handlers.js: registers user-scoped subscribe and unsubscribe channel handlers for dashboard, notifications, portfolio, and trades
- socket-broadcaster.js: provides service-safe emit helpers for dashboard, notifications, portfolio, and trade events
- socket-events.js: central socket event names
- socket-room.js: room naming helpers