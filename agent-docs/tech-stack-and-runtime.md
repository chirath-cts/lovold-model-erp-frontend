# Tech Stack and Runtime

## Frontend
- React 19 + TypeScript
- Vite
- Material UI (MUI) + MUI Icons
- MUI X Charts
- SCSS modules/partials
- React Query
- React Hook Form + Zod

## Backend
- Node.js + Express
- SQLite persisted local database

## Data and Dev Utilities
- Seed generation from `mock/db.json`
- JSON Server fallback mode

## Runtime Configuration
- Default frontend API base URL: `http://localhost:4001`
- Override with `VITE_API_BASE_URL` when needed

## Run Modes

### Recommended
Frontend + Express/SQLite backend

```bash
npm run start:backend