# Garden Planner

A browser-based garden planning app that helps home gardeners design and manage their garden beds based on location, space, and plant choices. Designed as a fully static client-side app deployable to GitHub Pages.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **State**: Zustand with localStorage persistence for gardens, plants, and theme
- **Routing**: wouter (with base path support for GitHub Pages)
- **Build**: Vite static build → deployed via GitHub Actions to GitHub Pages
- **No backend required** — all data lives in the browser's localStorage

## Pages

- `/` — Dashboard with garden plots, location zone widget, plant count summary, import/export, beginner tips
- `/planner/:id` — Visual grid planner for a specific garden box (click-to-place plants, companion warnings, print view)
- `/plants` — Plant catalog viewer with search/filter, add new plants, delete plants

## Data Model

- Plants stored client-side in localStorage via Zustand (`use-plant-store.ts`), seeded with 7 default plants
- Garden boxes stored client-side in localStorage via Zustand (`use-garden-store.ts`)
- Each garden has: id, name, season, width, length, grid (Record<"x,y", GridCell>), createdAt
- Each plant has: id, name, type, spacing, sunlight, water, fertilizer, companionPlants[], incompatiblePlants[]
- Plant type defined in `client/src/lib/types.ts`

## Features

- Visual click-to-place planting grid with companion planting warnings
- Client-side USDA zone and frost date lookup (bundled data for all 50 states)
- Add/manage custom plants
- Year/season tagging on gardens
- Duplicate/copy gardens
- Export all data or single gardens as JSON files
- Import previously exported JSON files
- Plant count summary across all gardens (for seed shopping)
- Print-friendly garden view
- Dark mode toggle (persisted in localStorage)

## Key Files

- `client/src/lib/types.ts` — Plant type definitions
- `client/src/lib/zone-data.ts` — Bundled USDA zone lookup data
- `client/src/hooks/use-garden-store.ts` — Zustand store for garden layouts
- `client/src/hooks/use-plant-store.ts` — Zustand store for plant catalog
- `client/src/hooks/use-location.ts` — Client-side location/zone lookup hook
- `client/src/hooks/use-theme.ts` — Dark mode theme hook
- `client/src/components/DataManager.tsx` — Export/import functionality
- `client/src/components/PlantingGrid.tsx` — Interactive garden grid
- `client/src/components/PlantCarePanel.tsx` — Plant detail panel
- `client/src/components/LocationWidget.tsx` — Zone/frost date widget
- `client/src/components/CreateGardenDialog.tsx` — New garden dialog with season picker
- `client/src/pages/Home.tsx` — Dashboard
- `client/src/pages/Planner.tsx` — Grid planner with print support
- `client/src/pages/Plants.tsx` — Plant catalog management
- `.github/workflows/deploy.yml` — GitHub Actions deployment workflow

## Theme

Earth-tone organic palette: sage greens, terracotta, cream backgrounds. Uses DM Sans (body) and Fraunces (headings) fonts. Dark mode uses a deep forest theme.

## Deployment

The app deploys automatically to GitHub Pages when code is pushed to `main` via GitHub Actions. The workflow builds a static site with Vite and deploys to GitHub Pages.

GitHub repo: https://github.com/ChristaStephens/garden-planner
