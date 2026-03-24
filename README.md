# Lovold ERP Frontend

Frontend-only Lovold ERP application built with Vite, React, TypeScript, Tailwind, React Router, and React Query.

## Current State

The repository is being rebuilt screen by screen.

Current implemented runtime areas:

- login
- protected app shell
- dashboard
- shared frontend utilities and mock service layer

The broader target ERP scope is documented, but not all target screens are implemented yet.

Use these docs for product direction:

- `agent-docs/finalized-project-spec.md`
- `agent-docs/ui-designer-product-spec.md`

## Frontend Rules

- frontend-only project
- mock-data-driven
- no backend required
- Tailwind is the UI implementation standard
- do not reintroduce MUI

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Rebuild mock data if needed:

```bash
npm run generate-mock
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Project Notes

- mock data lives under `mock/` and the service layer under `src/services/`
- routing starts in `src/app/router.tsx`
- shared app wiring lives in `src/app/`
- feature screens live in `src/features/`
- styling entry points are `src/styles/tailwind.css` and `src/styles/index.scss`

## Agent Notes

If you are updating the project with an agent:

- read `AGENTS.md`
- follow `RTK.md`
- use Tailwind for new UI work
