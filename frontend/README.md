# Frontend

This folder contains the frontend application for Cloudi Sync Trading Agent.

## Stack

- Vite
- React
- TypeScript

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` type-checks and builds the production bundle.
- `npm run preview` serves the production build locally.

## Structure

- `src/components` reusable UI pieces
- `src/pages` route-level views
- `src/services` API clients and server communication
- `src/store` shared state
- `src/styles` global styles and design tokens
- `src/utils` shared helpers

## Backend Contract

The frontend should communicate only with the Node backend. It must not talk directly to the Python trading engine.