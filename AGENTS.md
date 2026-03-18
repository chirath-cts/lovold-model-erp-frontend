# Agent Guide

## Scope & Sources
- Read: `agent-docs/project-overview.md`, `agent-docs/modules-phase1.md`, `agent-docs/data-model-and-api.md`, `agent-docs/coding-rules.md`, `agent-docs/roadmap-and-non-goals.md`.
- Validate entity names/relations with `agent-docs/er-diagram.jpg` (customers -> orders -> order_product -> products -> categories; customer_product for pricing; users for ops). Phase 2 tables (suppliers, supplier_product, inventory, warehouses, order_status_history) exist in the diagram but stay inactive.

## Phase 1 Boundaries
- Ship only catalog, customer pricing (`customer_product`), orders (with line profit/cost/discount fields), customers, and dashboard. No inventory, warehouse, supplier/procurement, status history, or auth additions.
- Preserve API contracts and aliases: `/categories` (canonical) + `/productCategories`; `/products`; `/customers`; `/orders`; `/orderItems` <-> `order_product`; `/customer-products` or `/discounts` <-> `customer_product`; `/users`.
- Keep SQLite schema and seeds aligned to ER keys (e.g., `order_number` unique on orders, `category_id` on products, validity window + `is_active` on customer_product).

## Work Rules
- Minimal, high-confidence changes; reuse MUI-first + React Query + React Hook Form + Zod; SCSS only for necessary custom styling.
- Keep compatibility aliases working; avoid Phase 2 features or new abstractions when existing patterns fit.
- For larger tasks share a brief plan; after changes, state what changed/preserved and any risks.
- Update docs when behavior/contracts change; ensure build and lint pass where touched.

## Commands
- Frontend + Express/SQLite: `npm run start:backend`
- Frontend + JSON Server fallback: `npm run start`
- Backend only: `npm run backend:dev` | `npm run backend:start`
- Reset + reseed DB: `npm run backend:reset`
- Frontend dev: `npm run dev`; Build: `npm run build`; Lint: `npm run lint`

## Repo Map
- `agent-docs/` - project rules, scope, data model, ERD.
- `src/` - React/MUI frontend.
- `backend/` - Express + SQLite API.
- `mock/` - seed data generation; `designs/` - visual references; `public/` - static assets.

## Delivery Checklist
- Phase 1 scope only; entities/relations match ER diagram naming.
- Public API aliases remain intact; compatibility mappings not broken.
- Build and lint pass; docs updated if behavior/contracts change.
