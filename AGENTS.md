# Agent Guide

Read this file before making changes in this repository.

## Required Repo Rules

- Follow [RTK.md](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/RTK.md).
- Prefix shell commands with `rtk`.
- Treat this repo as frontend-only unless the user explicitly changes scope.

## Project Snapshot

This repository is a Vite + React 19 + TypeScript frontend for the Lovold ERP project.

Current stack in the checked-in code:

- Vite
- React 19
- TypeScript
- React Router
- TanStack React Query
- Tailwind CSS v4
- SCSS / SCSS modules
- mock-data services only

Important runtime reality:

- the app is frontend-only
- there is no real backend in scope
- data currently comes from mock or local service layers
- auth is lightweight local session gating
- the live routed UI is currently much smaller than the full intended ERP scope

## Current Implementation Reality

The checked-in runtime currently centers on:

- login flow
- protected app shell
- dashboard
- shared UI primitives
- mock service layer

Files worth understanding before substantial frontend work:

- [package.json](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/package.json)
- [src/main.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/main.tsx)
- [src/app/AppProviders.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/app/AppProviders.tsx)
- [src/app/router.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/app/router.tsx)
- [src/app/auth/RequireAuth.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/app/auth/RequireAuth.tsx)
- [src/features/auth/pages/LoginPage.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/features/auth/pages/LoginPage.tsx)
- [src/app/layout/AppLayout.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/app/layout/AppLayout.tsx)
- [src/app/layout/Sidebar.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/app/layout/Sidebar.tsx)
- [src/app/layout/Topbar.tsx](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/app/layout/Topbar.tsx)
- [src/shared/constants/navigation.ts](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/shared/constants/navigation.ts)

Do not assume that all target ERP screens already exist just because navigation constants or docs mention them.

At the moment:

- the router is still thin
- the broader ERP scope is documented mostly in `agent-docs`
- future implementation work should reconcile current code with the finalized docs rather than assuming the docs are already implemented

## Product / Scope Source Of Truth

Use these docs to understand the intended product direction:

- [agent-docs/finalized-project-spec.md](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/agent-docs/finalized-project-spec.md)
- [agent-docs/ui-designer-product-spec.md](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/agent-docs/ui-designer-product-spec.md)

Use the finalized project spec as the main functional source of truth when implementing new business features.

The UI designer spec and Stitch prompt pack are supporting design references, not the canonical behavior spec.

## Styling And UI Rules

This repo is now Tailwind-first and MUI has been removed from the active frontend stack.

Current styling reality:

- new and current UI work should use Tailwind
- SCSS and SCSS modules still exist in some files
- do not reintroduce MUI

### Going Forward

New frontend implementation should use Tailwind.

Rules:

- build new UI with semantic React markup plus Tailwind classes
- prefer Tailwind for layout, spacing, borders, typography, states, and responsive behavior
- do not add MUI back into the project
- if stale MUI references are encountered, treat them as cleanup debt rather than a pattern to continue

### Practical Migration Rule

When touching older files:

- if the file already uses Tailwind, stay in Tailwind
- if the file still has stale pre-migration references, do not preserve or extend them
- if you are building a new component, new page, new section, or substantial new UI, use Tailwind

### Precedence

[src/styles/STYLING_GUIDELINES.md](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/styles/STYLING_GUIDELINES.md) should stay aligned with this file.

For future work:

- Tailwind is the standard path
- MUI should not be reintroduced

### Current Styling Entry Points

- [src/styles/tailwind.css](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/styles/tailwind.css)
- [src/styles/index.scss](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/src/styles/index.scss)

## Frontend Architecture Notes

Preferred code organization:

- `src/app` for app shell, providers, routing, auth gate
- `src/features` for feature-owned pages and feature UI
- `src/shared` for reusable UI, constants, hooks, utilities, types, and forms
- `src/services` for mock service endpoints and data access behavior

Use existing alias style imports such as `@/...` consistently.

## Data And Service Rules

- Keep the app frontend-only.
- Use the existing mock service pattern in `src/services`.
- Do not invent backend contracts unless the user asks for them.
- Favor practical mock-data behavior that supports UI flows.

When building new business features:

- align with the finalized project spec in `agent-docs`
- keep data structures implementation-practical
- do not overdesign backend schemas or persistence models

## Routing And Navigation Rules

- Check the actual router before assuming a page is live.
- Check navigation constants before adding duplicate route concepts.
- If a route is missing but a feature is being implemented, wire it intentionally instead of assuming another file already handles it.

## Implementation Expectations

- Keep TypeScript clean and explicit.
- Reuse existing shared utilities where it makes sense.
- Prefer small, composable components.
- Match the current import alias patterns and file organization.
- Preserve existing behavior unless the task explicitly changes it.

For frontend UI work specifically:

- use Tailwind for new UI
- do not add MUI back into the codebase
- keep new work aligned with the dashboard/login Tailwind direction

## Validation

Before wrapping up significant changes, run the relevant checks when possible:

- `rtk npm run build`
- `rtk npm run lint`

If you cannot run a check, say so clearly.
