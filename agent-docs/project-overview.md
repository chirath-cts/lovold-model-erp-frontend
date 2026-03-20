# Lovold ERP MVP (Phase 1)

## Project Overview
Lovold ERP MVP is a Phase 1 working vertical slice for Lovold's aquaculture business workflows. The scope now centers on catalog, customer-specific pricing, sales orders, and operational users. Supplier, warehouse, inventory control, and status history are explicitly deferred to Phase 2.

The current system covers:

- Product and category visibility (no stock levels in Phase 1)
- Customer-specific pricing/discount agreements (customer-product mapping)
- Sales orders with multi-line pricing and profit capture (no stock impact yet)
- Customer directory and customer detail analytics
- Operational dashboard with KPI and chart visibility (stock KPIs postponed)

This is still an MVP, but it is no longer only a frontend simulation. The current Phase 1 build runs with a lightweight Express + SQLite backend, seeded with realistic demo data for Phase 1 entities.

## Current Status (Implemented Now)

Phase 1 is implemented as a modular frontend + lightweight backend stack:

- Frontend: React + Vite + TypeScript, MUI-first UI, SCSS for custom styling
- Backend: Express API with SQLite persistence
- Data seeding: deterministic seed bootstrap from `mock/db.json` aligned to Phase 1 tables
- Fallback mode: JSON Server is still available for local fallback/demo mode

Key business behavior already in place:

- Orders can be created with multiple lines and store per-line cost/price/discount/tax
- Dashboard and lists refresh from live collections
- Order and line-level profit values are persisted and displayed

## Phase 1 Objectives

Phase 1 delivers a realistic, demo-ready ERP slice that enables users to:

- Monitor business KPIs and trends on the dashboard (non-stock KPIs only)
- View product catalog with category context
- Manage customer-specific pricing agreements (Customer_Product)
- Create and track sales orders
- Browse customers and inspect customer-level commercial metrics

The intent is still validation-first, but with real API interactions and persisted MVP data.

## Domain Context

Lovold operates in a B2B aquaculture context with equipment, components, and operational products.

Core ERP needs reflected in this MVP:

- Inventory tracking (postponed to Phase 2; Phase 1 tracks catalog only)
- Customer-specific pricing control
- Order lifecycle monitoring
- Profit visibility
- Business dashboarding

## Tech Stack (Current)

### Frontend

- React 19 + TypeScript
- Vite
- Material UI (MUI) + MUI Icons
- MUI X Charts
- SCSS modules/partials for custom styling
- React Query
- React Hook Form + Zod

### Backend

- Node.js + Express
- SQLite (persisted local DB)

### Data/Dev Utilities

- Seed generation from `mock/db.json`
- JSON Server (fallback mode)

### Runtime Configuration

- Default frontend API base URL: `http://localhost:4001`
- Override with `VITE_API_BASE_URL` when needed

## Design and Branding

Current UI direction:

- MUI-first design system
- SCSS used only for custom/non-standard visuals
- Consistent enterprise layout and table patterns
- Standard monetary display in `NOK`

Primary palette (current direction):

- Primary: `#003A4D`
- Primary container: `#00526C`
- Secondary: `#1F6581`
- App background: `#F4FAFF`

## Navigation Structure

- Dashboard
- Inventory
  - Products
  - Categories
  - Customer Pricing (formerly Discounts)
- Sales
  - Orders
- Customers

## Module Breakdown

### 1) Dashboard

Implemented now:

- KPI cards:
  - Total Sales
  - Total Orders
  - Estimated Profit
  - Active Customers
- Charts:
  - Sales trend
  - Orders by status
- Panels:
  - Recent orders
  - Top customers and top products

Not in current Phase 1 dashboard:

- Time-scope filter controls (Today/Week/Month)
- Stock/low-inventory KPIs (deferred to Phase 2)

### 2) Inventory

#### Products

Implemented fields/behavior:

- Product name + SKU
- Category
- Base selling price (`base_price`/`basePrice` mapping)
- Unit of measure (`unit`)
- Product status
- Description

#### Categories

Implemented now:

- List categories
- Create category (modal/dialog flow)

#### Customer Pricing (Customer_Product)

Implemented now:

- Customer-specific pricing/discount agreements per product
- Fields: discount percent, validity window (start/end dates), active flag
- Filter by status/active window when selecting products for an order
- Order dialog supports line-level discount input; applies active agreement when present

Model behavior in current Phase 1:

- Simple agreement model only (no stacking/precedence engine)
- Discounts are represented through Customer_Product; no standalone campaign entity

### 3) Sales

#### Orders List

Implemented now:

- Status filter
- Revenue/profit/active order summaries
- Orders table with status, totals, and profit

#### Create Order Flow

Implemented now:

- Customer selection
- Multi-line order items
- Product selection and quantity
- Discount type/value per line (aligned to Customer_Product when applicable)
- Live subtotal/discount/total/profit summary

Write behavior:

1. Create order
2. Create order items
3. Refresh related views via query invalidation

Failure handling:

- Compensating rollback logic restores consistency on partial write failures

Profit model:

- Line profit and order profit are calculated and stored
- Order default status on save: `confirmed`

### 4) Customers

#### Customer Directory

Implemented now:

- Customer code/company/contact/country/status
- Derived order count and total sales
- Last order date

#### Customer Detail

Implemented now:

- Customer summary block
- Aggregated commercial metrics
- Order history table

## Data Model and Storage (Current)

Backend schema includes Phase 1 ER coverage:

- `customers`
- `categories`
- `products`
- `orders`
- `order_product`
- `customer_product`
- `users`

Phase 2 (postponed, not active in Phase 1 flows):

- `suppliers`
- `supplier_product`
- `inventory`
- `warehouses`
- `order_status_history`

All core Phase 1 relations are enforced with SQLite foreign keys and supporting indexes.

### Frontend Compatibility Mapping

Frontend resource contracts are preserved via API mapping:

- `/orderItems` <-> `order_product`
- `/discounts` <-> `customer_product` (compatibility alias for customer-specific pricing)
- `/customer-products` <-> `customer_product`
- `/productCategories` is a compatibility alias of `categories`

Canonical endpoint for categories remains:

- `/categories`

### Seed Coverage Notes

- Seeds cover Phase 1 entities (customers, categories, products, orders, order_product, customer_product, users) with relational integrity
- Phase 2 entities (supplier, warehouse, inventory, status history) are excluded from Phase 1 seed or kept inert for forward compatibility
- Order line snapshots keep historical pricing/cost integrity

## Public API Contracts (Phase 1)

Primary frontend resources:

- `/categories`
- `/productCategories` (alias)
- `/products`
- `/customers`
- `/orders`
- `/orderItems`
- `/customer-products` (or `/discounts` alias for backward compatibility)
- `/users`

Supported query behavior (current):

- Filtering: `status`, `customerId`, `categoryId`, `orderId`
- Search: `q` (products)
- Sorting: `_sort`, `_order` with allowlisted sortable columns

Customer pricing API shape:

- `customerId`
- `productId`
- `discountPercent`
- `startDate`
- `endDate`
- `isActive`
- Derived `status`

## Architecture and Run Modes

### Recommended Phase 1 run mode

- Frontend + Express/SQLite backend:
  - `npm run start:backend`

### Fallback run mode

- Frontend + JSON Server:
  - `npm run start`

### Backend utility scripts

- Start backend only: `npm run backend:start`
- Dev backend only: `npm run backend:dev`
- Reset DB + reseed: `npm run backend:reset`

### Default ports

- Frontend (Vite): `5000`
- Express backend: `4001`
- JSON Server fallback: `4000`

## Phase Strategy

### Phase 1 (Current)

Implemented MVP slice with:

- Real persisted backend
- Modular frontend architecture
- Core catalog/customer-pricing/sales/dashboard workflows
- Manual validation readiness for stakeholder demos

### Phase 2 (Planned)

Likely next improvements:

- Supplier onboarding, procurement flows, and supplier-product terms
- Inventory tracking, stock thresholds/alerts, and warehouse logistics
- Order status history/audit trail
- Expanded reporting filters and drill-downs
- Order approval and richer operational workflow states

### Phase 3 (Planned)

Hardening path:

- Auth and authorization model
- Broader API/service hardening
- Automated test coverage strategy
- Production-readiness and deployment concerns

## Known Gaps / Non-goals (Phase 1)

- No inventory levels, warehouse locations, or procurement tracking
- No supplier onboarding or supplier-product terms
- No order status audit trail beyond the `status` field
- No authentication/authorization; users exist but security is deferred
- No automated test suite yet (manual acceptance + lint/build quality checks)

## Success Criteria for Phase 1

- Stakeholders can understand and validate end-to-end catalog -> customer pricing agreement -> order entry -> profit reporting without inventory or procurement
- UI/UX appears coherent and enterprise-ready
- Data interactions feel realistic and consistent
- Architecture supports incremental scale into later phases
- Team has a clear, aligned baseline for Phase 2 planning
