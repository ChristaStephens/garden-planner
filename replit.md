# Garden Planner

A browser-based garden planning app that helps home gardeners design and manage their garden beds based on location, space, and plant choices.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js API server
- **Database**: PostgreSQL (Replit managed) with Drizzle ORM
- **State**: Zustand with localStorage persistence for garden layouts; server DB for plant catalog
- **Routing**: wouter

## Pages

- `/` — Dashboard with garden plots, location zone widget, beginner tips
- `/planner/:id` — Visual grid planner for a specific garden box (click-to-place plants, companion warnings)
- `/plants` — Plant catalog viewer with search/filter, add new plants, delete plants

## Data Model

- `plants` table: id, name, type, spacing (inches), sunlight, water, fertilizer, companionPlants (jsonb), incompatiblePlants (jsonb)
- Garden boxes stored client-side in localStorage via Zustand

## API Routes

- `GET /api/plants` — List all plants
- `POST /api/plants` — Create a new plant
- `DELETE /api/plants/:id` — Delete a plant
- `GET /api/location?city=X&state=Y` — Get growing zone and frost dates

## Key Files

- `shared/schema.ts` — Drizzle table definitions and Zod schemas
- `shared/routes.ts` — API contract definitions
- `server/routes.ts` — Express route handlers + seed data
- `server/storage.ts` — Database storage layer
- `client/src/hooks/use-garden-store.ts` — Zustand store for garden layouts
- `client/src/hooks/use-plants.ts` — React Query hook for plant data
- `client/src/pages/Home.tsx` — Dashboard
- `client/src/pages/Planner.tsx` — Grid planner
- `client/src/pages/Plants.tsx` — Plant catalog management

## Theme

Earth-tone organic palette: sage greens, terracotta, cream backgrounds. Uses DM Sans (body) and Fraunces (headings) fonts.
