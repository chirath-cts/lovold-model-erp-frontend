# Finalized Project Spec

This file is the single source of truth for finalized product decisions for this project.

Implementation must follow this file once all sections are finalized.

This project remains frontend-only for now.

The finalized specification does not need to define a full production database design or backend implementation contract.

Where entities, relationships, and data structures are described, they should be understood as the required frontend domain model and mock-data structure needed to drive the UI and behavior.

## Section Status

- Products: finalized
- Categories: finalized
- Customer Pricing: finalized
- Orders: finalized
- Customers: finalized
- Auth / Session Behavior: finalized
- Inbound Tracker / Supplier POs: finalized
- ETA / Fulfillment Planning: finalized
- Dashboard: finalized
- Shared API / Data Model Notes: finalized

## Scope Change Notes

The earlier finalized sections were finalized against the requirements discussed up to that point.

Additional requirements introduced later may reopen a section if they materially change:

- entity definitions
- relationships
- workflows
- screens
- tracking behavior

The ETA and inbound-tracking requirements reopened the Orders area and introduced active scope for:

- inbound tracking
- supplier purchase orders
- ETA planning
- start-to-end order tracking

These areas are now finalized in this spec.

## Products

### Section Scope

The current Products area will evolve into a combined management area for:

- Products
- Components

Both must live in the same section, but components must always be clearly identifiable as components.

### Product Definition

Products are the base items of the system.

Products:

- are directly manageable in the Products section
- can be ordered directly
- are the base pricing unit for customer-specific pricing
- are the base unit used to build components

### Component Definition

Components are composite items made from one or more base products.

Components:

- behave as a single unit when used in an order
- must be manageable in the same section as products
- must be clearly labeled and identifiable as components
- can exist as ready-made inventory items
- must preserve their relationship to their underlying base products

### Product and Component Relationship

The system must support a component-to-products composition structure.

Each component is composed of one or more products, with a required quantity per product.

The system must store this composition so it can be used for:

- component definition
- pricing aggregation
- costing
- inventory consumption
- fulfillment logic

### Ordering Behavior

Orders must support both:

- direct product lines
- component lines

When a component is added to an order:

- it must behave as a single orderable unit from the user perspective
- it must still remain traceable to its underlying products for internal calculations and fulfillment

### Pricing Rules

Customer-specific pricing applies only to base products.

Component pricing must be derived from its underlying products.

The effective component amount must be calculated from:

- the aggregate of its constituent products
- using the effective applicable pricing of those base products

The system must not treat components as having independent customer pricing agreements separate from their constituent products.

### Component Production Value

A component must support its own production-related value in addition to the values of its constituent products.

This means the final component valuation must not be based only on the summed values of the underlying products.

Component calculations must account for:

- underlying product values
- component-level production value

This production value is required because the component behaves as a single prepared unit, not just as a raw bundle of products.

For now, the component-level production value must be represented as a fixed standard production cost stored on the component.

### Inventory and Fulfillment Behavior

Components may exist as ready-made inventory items.

When a component is ordered, the system must follow this behavior:

1. Consume available ready-made component inventory first.
2. If ready-made component inventory is insufficient, consume the remaining required quantity from the component's underlying products.
3. The remaining required quantity must be exploded using the stored component-to-products composition quantities.

This is the required fallback behavior for component fulfillment.

### Identification and UX Requirements

Within the shared Products section:

- products and components must be clearly distinguishable
- the UI must explicitly identify when an item is a component
- users must be able to manage components without confusing them with base products

### Data Model Direction

The finalized product domain must support the following concepts:

- products as base items
- components as composite items
- component-to-product composition mapping
- direct ordering of both products and components
- ready-made component inventory
- fallback consumption of underlying products when ready-made component inventory is insufficient
- customer pricing on products only
- component valuation derived from product pricing plus component-level production value

## Categories

### Section Scope

Categories will keep their current behavior.

Categories remain a lightweight classification layer used to organize items in the catalog area.

### Category Definition

Categories are simple classification records with the following fields:

- `id`
- `name`
- `description`

No additional category fields are required at this stage.

### Category Usage

Categories are used for item organization and filtering.

The current category behavior is accepted as-is.

### Current Functional Scope To Preserve

The Categories section must continue to support:

- category listing
- search by category name or description
- create category
- derived product count per category
- paginated category table

### Current UI/Behavior To Preserve

The current behavior of the Categories section is accepted without requiring structural changes.

This includes:

- category creation through the existing modal flow
- category listing with product counts
- current lightweight derived status behavior
- current summary cards and overview-style presentation

### Status Behavior

Category status does not need to become a stored field at this stage.

The current derived behavior is acceptable.

### Out of Scope For Categories

The Categories section does not currently require:

- edit category
- delete category
- parent/child category hierarchy
- category codes
- category-specific workflow expansion

### Relationship to Other Sections

Categories remain compatible with the Products section and continue to act as a simple classification layer.

No additional finalized behavior is being introduced for Categories in this phase beyond preserving the current implementation.

## Customer Pricing

### Section Scope

Customer Pricing will remain a lightweight agreement layer based on base products.

The current model direction is preserved:

- customer-specific pricing is defined against base products only
- components do not get separate direct customer pricing agreements

### Pricing Ownership

Customer pricing belongs to base products.

Components must derive their customer-visible pricing from the pricing of their constituent base products.

This means:

- base products are the pricing source
- components must expose pricing visibility based on their underlying base products
- components must not have an independent customer pricing agreement model at this stage

### Current Agreement Model To Preserve

Customer pricing agreements remain product-specific and continue to use the current agreement structure:

- `customerId`
- `productId`
- `discountPercent`
- `startDate`
- `endDate`
- `isActive`
- derived `status`

### Status Behavior

Status remains derived behavior rather than a separately managed business field.

The current validity model is preserved:

- active agreements are available for pricing use
- future agreements are visible but not active yet
- expired agreements are visible for reference but not active for pricing use

### Current Functional Scope To Preserve

The Customer Pricing section must continue to support:

- listing customer pricing agreements
- filtering by derived status
- creating a customer pricing agreement
- displaying customer, product, discount percent, validity range, and status

### Component Pricing Visibility

For components, customer pricing must be visible through the underlying base products.

This means the system must derive component pricing visibility from the pricing agreements attached to the component's constituent products.

The component must not require a separate pricing agreement record for customer-specific pricing to be understood or calculated.

### UI Expectations

The UI may include edit and delete action buttons where appropriate for design continuity and future expansion.

However:

- edit functionality is not required at this stage
- delete functionality is not required at this stage

If such buttons are shown, they are present only as UI placeholders unless later finalized in another decision.

### Out of Scope For Now

The following are not required at this stage:

- edit customer pricing agreements
- delete customer pricing agreements
- separate component pricing agreements
- expanded validation workflows beyond the current lightweight behavior

### Relationship to Orders

Orders must continue to use customer pricing derived from active base-product agreements.

When a component is used in an order, its customer pricing view and calculation must come from the underlying base products rather than from a component-specific pricing record.

## Orders

### Section Scope

Orders must evolve from product-only order entry into an order flow that supports:

- products
- components
- inventory reservation
- order status progression
- order-level production tracking

### Order Statuses

The finalized order statuses are:

- `draft`
- `confirmed`
- `reserved`
- `in_production`
- `ready`
- `dispatched`
- `delivered`
- `cancelled`

Orders must support real status behavior using this lifecycle model.

### Order Line Types

Order lines must support two separate selectable item choices:

- product
- component

These must be presented as separate choices in the order-entry experience rather than as a single undifferentiated item list.

### Component Visibility In Orders

When a component is selected in an order:

- it must behave as a single orderable unit
- the system must also show its underlying product breakdown

The underlying product breakdown should be visible to the user for clarity.

### Pricing Behavior In Orders

Manual pricing override capability must remain available for now.

The order flow must therefore support:

- derived pricing from base products and customer pricing rules
- manual override by the user where needed

### Component Pricing In Orders

The base component valuation used for pricing must include:

- the effective constituent product pricing
- the component's fixed standard production cost

This component pricing model is separate from order-level production execution tracking.

### Inventory Reservation Behavior

Inventory must support a reserved-state concept.

Reserved inventory must not be shown as available for new orders.

Reservation must happen when an order reaches the `confirmed` state.

Orders must also support stored ETA planning fields, as defined in the ETA / Fulfillment Planning section of this spec.

### Reservation Rules For Products

When a product line is confirmed:

- the required quantity must be reserved
- reserved quantity must reduce available quantity for subsequent orders

### Reservation Rules For Components

When a component line is confirmed:

1. Reserve available ready-made component inventory first.
2. If ready-made component inventory is insufficient, reserve the underlying base products required for the remaining quantity using the stored component composition.

This reservation behavior is the order-stage equivalent of the finalized component fulfillment model.

If ready-made component inventory is insufficient, the system must evaluate and reserve the required underlying products.

### Inline Component Creation From Orders

The order page must support creating a component during order entry.

This is required for the case where:

- the user needs to order a component
- ready-made component stock is not available
- the underlying products exist

The order flow must allow the user to create that component from the order context.

When creating a component from the order page, the user must have the option to:

- save the component for future use

### Production Process In Orders

Each order can have:

- no production steps
- one production step
- multiple production steps

Production steps are order-level for now.

They do not need to be line-level at this stage.

### Production Step Requirements

Each production step must support:

- work center allocation
- step name
- optional description
- cost
- time taken
- optional step status

Work center allocation must be selectable by the user.

Examples of work center options may include:

- rope cutting
- fixing and throwing
- assembly

The system must support this as a selectable production-step field rather than leaving it as free-form process tracking only.

### Order Costing Relationship

Order-level production steps represent actual production execution tracking for the order.

Their costs must be captured separately from the component's fixed standard production cost.

This separation is required to avoid mixing:

- standard component valuation
- actual order production execution cost

### Profit And Cost Treatment

The order domain must support both:

- component master pricing based on constituent products plus fixed standard production cost
- actual order production-step costs captured during order execution

These are distinct concepts and must remain distinct in the finalized model.

### Current Functional Direction To Replace

The current product-only order model is no longer sufficient.

The finalized Orders model must move away from product-only assumptions and support:

- component-aware ordering
- component breakdown visibility
- reservation-based inventory handling
- inline component creation
- order-level production-step tracking
- stored ETA planning
- start-to-end order tracking

### ETA Relationship

Each order must support stored ETA fields so that the system can:

- promise a delivery date to the customer
- filter delayed orders
- trace where the delay comes from

Orders must store:

- `materialAvailabilityEta`
- `productionCompletionEta`
- `deliveryEta`
- `promisedEta`

`promisedEta` is the customer-facing committed ETA.

### Confirmation-Time Behavior

When an order reaches `confirmed`:

- inventory reservation must happen
- material availability must be evaluated
- ETA fields must be calculated and stored on the order

This stored ETA behavior is required because delayed-order reporting depends on persisted planned dates rather than only live recalculation.

## Inbound Tracker / Supplier POs

### Section Scope

Supplier purchase orders and inbound tracking are active scope in this project.

The system must include an inbound-tracker area where Lovold can view supplier purchase orders and expected arrivals.

### Supplier Entity

Suppliers are now active entities in the project.

They must be visible in the system as the source of inbound product purchasing.

### Supplier Purchase Order Scope

Inbound supplier purchase orders are used to bring products into the business.

For now:

- supplier purchase orders are for base products only
- supplier purchase orders do not contain components

### Inbound Tracker Screen

The system must include an Inbound Tracker / Supplier POs page.

That page must list supplier purchase orders and their arrival timing.

### Supplier Purchase Order Statuses

The finalized supplier purchase order statuses are:

- `draft`
- `ordered`
- `partially_received`
- `received`
- `cancelled`

### Supplier Purchase Order ETA

Each supplier purchase order must store an arrival ETA.

This ETA is required for inbound planning and order ETA calculation.

### Supplier Purchase Order Line Tracking

Supplier purchase order lines must support line-level receipt tracking.

Each line must track at least:

- ordered quantity
- received quantity
- remaining quantity

This is required to support inbound availability and partial receipt behavior.

### Inbound Availability Rule

When the system needs to evaluate inbound material availability for an order, it must use:

- the earliest date at which the full required quantity becomes available

This means the system must not use only the earliest inbound date if that date does not provide enough quantity.

The ETA engine must consider quantity sufficiency across inbound purchase orders and lines.

### Relationship To Orders

Supplier purchase orders and inbound ETA data are part of the order-planning model.

They are required when on-hand available inventory is insufficient for an order.

## ETA / Fulfillment Planning

### Section Scope

The system must support stored ETA planning for customer orders.

This planning must cover:

- material availability
- production completion
- delivery timing
- final promised ETA

### Stored ETA Fields

Each order must store all of the following:

- `materialAvailabilityEta`
- `productionCompletionEta`
- `deliveryEta`
- `promisedEta`

These fields must be stored rather than kept as live-only derived values.

### Why ETA Must Be Stored

Stored ETA values are required so the system can:

- identify delayed orders
- filter delayed orders
- compare planned and actual execution behavior later

### Material Availability Rule

If all required materials are available in inventory, material availability is satisfied from current available stock.

If some required materials are missing, the system must look to inbound supplier purchase orders.

The material-availability result must be based on:

- the earliest date at which the full missing quantity becomes available

If stock is partly available and partly missing, ETA must be driven by the bottleneck date required to complete the full quantity.

### Inventory Basis For ETA

Reserved stock must not be treated as available for new orders.

ETA calculations must use available inventory, not total stock.

### Production Timing Rule

After material availability is determined, the system must include production time.

Production completion planning must also include fixed business lead items for:

- quality checks
- packaging

These are fixed lead settings for the whole business, not per-order freeform lead definitions.

### Delivery Timing Rule

Delivery timing is conceptually influenced by multiple factors, but for now it will be manually entered at the order level.

The system must therefore support a manual delivery-time input for order ETA planning.

### ETA Calculation Direction

The ETA planning flow must follow this direction:

1. Determine material availability from available stock and inbound supplier POs.
2. Add production duration.
3. Add fixed quality-check lead time.
4. Add fixed packaging lead time.
5. Add manually entered delivery time.
6. Store the resulting breakdown and final promised ETA on the order.

### Relationship To Order Tracking

Orders must be trackable from start to end.

ETA planning is part of that tracking model and must align with:

- order statuses
- inventory reservation
- inbound material availability
- production execution
- delivery planning

## Shared API / Data Model Notes

### Section Scope

This section defines the required frontend domain model and mock-data structure for the finalized behavior.

This is not a full backend schema design.

It is the practical mock-data and frontend-entity model needed to support the UI and behavior.

### Required Frontend Domain Entities

The finalized frontend domain model must support at least the following entities:

- `categories`
- `products`
- `components`
- `componentProducts`
- `customers`
- `customerProducts`
- `suppliers`
- `supplierPurchaseOrders`
- `supplierPurchaseOrderItems`
- `orders`
- `orderItems`
- `orderProductionSteps`
- `workCenters`
- `users`

### Categories

Categories apply to:

- products
- components

Categories therefore serve as a classification layer for both item types.

### Products

Products remain base items and must support explicit stock tracking fields.

At minimum, products must support:

- `stockQuantity`
- `reservedQuantity`

Available quantity should be derived from these values in the frontend behavior layer.

### Components

Components are separate entities from products.

Components must also support explicit stock tracking fields.

At minimum, components must support:

- `stockQuantity`
- `reservedQuantity`
- `standardProductionCost`

Displayed and usable component pricing must be derived rather than stored as a fixed independent final selling price.

### Component Composition

The relationship between components and base products must be represented through `componentProducts`.

This structure must support:

- component definition
- quantity-per-product composition
- pricing derivation
- reservation logic
- fulfillment logic

### Customer Pricing

Customer pricing remains product-only.

`customerProducts` must continue to represent customer-specific pricing agreements on base products.

Components must derive pricing visibility and calculation from their underlying products.

### Suppliers

Suppliers are active entities in the frontend model.

They must be visible in the UI as the source of inbound product purchasing.

### Supplier Purchase Orders

`supplierPurchaseOrders` are active frontend entities.

They must support:

- supplier linkage
- purchase order status
- header-level ETA

The purchase order header ETA is sufficient for now.

### Supplier Purchase Order Items

`supplierPurchaseOrderItems` must support line-level inbound tracking for products only.

At minimum, each PO item must support:

- product reference
- ordered quantity
- received quantity
- remaining quantity

Components are out of scope for supplier PO lines.

### Orders

Orders remain customer-linked entities and must also support stored ETA planning fields:

- `materialAvailabilityEta`
- `productionCompletionEta`
- `deliveryEta`
- `promisedEta`

These fields must be stored on the order in the frontend domain model.

### Order Items

Order items must move from product-only assumptions to a generic sellable-line model.

Each order item must support:

- `itemType`
- `itemId`
- `itemName`
- `itemSku`
- `quantity`
- `unitPrice`
- `lineSubtotal`
- `discountPercent`
- `discountAmount`
- `lineTotal`
- `unitCostAtSale`
- `profitAmount`

`itemType` must support:

- `product`
- `component`

### Order Production Steps

Orders must support zero or many order-level production steps.

Each production step must support:

- order linkage
- work center reference
- step name
- optional description
- cost
- time taken
- optional status

### Work Centers

Work centers should be a simple list for now.

They do not need a richer master-data structure at this stage.

### Warehouses

Warehouses remain out of scope for now.

The finalized frontend model does not need warehouse-level data structures in this phase.

### Query and Frontend Resource Direction

Existing compatibility aliases must remain intact where already finalized.

The expanded frontend resource model should preserve the existing style and continue to support the current compatibility-oriented approach.

### Practical Data-Model Principle

The shared model should remain implementation-practical for a frontend-only mock-data system.

The purpose of this model is:

- to drive UI behavior
- to support realistic mock interactions
- to support derived calculations and tracking

It is not intended to become a full production backend schema specification in this phase.

## Dashboard

### Section Scope

The Dashboard must provide high-level commercial and operational visibility across the finalized frontend domain model.

It should reflect:

- sales performance
- order progress
- ETA risk
- inbound dependency
- reservation-aware inventory pressure
- top commercial items

### Core KPIs

The Dashboard should support KPI visibility for:

- total sales
- total orders
- estimated profit
- delayed orders
- orders in production
- orders awaiting materials
- active customers
- inbound due soon

### Operational Panels

The Dashboard should support operational panels for:

- recent orders
- delayed orders
- upcoming inbound supplier purchase orders
- low available stock items
- orders by status
- ETA risk orders
- top customers
- top sellable items

### ETA And Planning Visibility

The Dashboard must support visibility into ETA-driven operational planning.

This should include:

- delayed versus on-track orders
- orders grouped or surfaced by promised ETA
- bottleneck orders waiting for inbound materials
- bottleneck orders waiting for production completion

### Inventory Visibility

Inventory visibility on the Dashboard should move away from simple low-stock-only logic.

The inventory-oriented dashboard view should reflect the more useful operational concepts:

- low available stock
- high reserved stock
- component shortage risk

### Sellable Ranking

The Dashboard should rank and surface top commercial items using a combined sellable-item model.

This means top-item visibility should combine:

- products
- components

The Dashboard should therefore use a top sellable items view rather than a product-only ranking.

### Time Filters

The `Today / Week / Month` controls do not need to become functional in this phase.

They may remain present as non-functional UI controls for now.

### Relationship To Finalized Scope

The Dashboard must align with the finalized project behavior, including:

- component-aware ordering
- reservation-aware inventory logic
- supplier inbound tracking
- stored ETA planning
- order production tracking

### Implementation Direction

The Dashboard should remain practical and mock-data driven.

It does not need deep backend analytics design in this phase, but it must reflect the finalized frontend behavior and operational decisions captured elsewhere in this spec.

## Customers

### Section Scope

The Customers section will keep its current behavior for now.

Customers remain a commercial directory and customer-detail view layer for order-related visibility.

### Customer Definition

Customers remain lightweight account records with the current fields:

- `id`
- `customerCode`
- `name`
- `email`
- `phone`
- `address`
- `status`

No additional customer master fields are required at this stage.

### Current Functional Scope To Preserve

The Customers section must continue to support:

- customer directory listing
- customer search
- filtering by status
- filtering by region/country derived from address
- customer detail page
- order-based commercial metrics per customer

### Directory Behavior To Preserve

The customer directory should continue to present:

- customer code
- customer name
- contact information
- derived country/region
- order count
- revenue
- last order date
- customer status

### Customer Detail Behavior To Preserve

The customer detail page should continue to present:

- customer summary information
- status
- total orders
- total sales
- estimated profit
- items purchased
- order history

### Metrics Behavior

Customer metrics remain derived from orders and order items.

These metrics do not need to become stored customer master data at this stage.

### Out of Scope For Now

The following are not required at this stage:

- create customer functionality
- edit customer functionality
- delete customer functionality
- expanded customer master data
- customer-specific workflow expansion beyond the current directory/detail behavior

### Relationship to Other Sections

Customers continue to function as a commercial visibility layer tied to:

- orders
- order profitability
- customer pricing relationships

No additional finalized customer behavior is being introduced in this phase beyond preserving the current implementation.

## Auth / Session Behavior

### Section Scope

Auth and session behavior will remain as currently implemented.

No new auth or session design changes are being introduced at this stage.

### Current Behavior To Preserve

The current auth/session layer should continue to behave as a lightweight access gate for the frontend.

This includes:

- login screen access
- session-based route protection
- local session persistence
- logout behavior

### Current Functional Direction To Preserve

The current implementation is sufficient for this phase and does not need additional expansion.

### Out of Scope For Now

The following are not required at this stage:

- auth redesign
- permission model expansion
- role-based access redesign
- production-grade authentication hardening
- broader session-management changes

### Relationship to Other Sections

Auth / Session Behavior is intentionally being left unchanged for now.

Implementation should preserve the current behavior unless a later finalized decision explicitly changes it.
