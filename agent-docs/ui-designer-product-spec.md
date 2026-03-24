# Lovold ERP UI Designer Product Specification

## Document Purpose

This document is a designer-facing product specification for the future-state Lovold ERP experience.

It is written for a UI designer who has not seen the current implementation and does not know the product domain yet.

The goal of this document is to explain:

- what the product is
- who uses it
- what each section of the product does
- how the sections connect
- what business rules are fixed
- what screens need to exist
- what each screen must communicate

This is intentionally a product and UX specification, not a backend or database specification.

The project remains frontend-only for now and uses mock or hardcoded data. The design should still feel like a realistic ERP product with operational depth.

## 1. Product Overview

### What Lovold ERP Is

Lovold ERP is an internal operations system for Lovold.

Lovold receives customer demand through its existing external platform. Internal staff then use this ERP to:

- register and track customer orders
- manage catalog items
- manage components built from base products
- understand customer-specific pricing
- track inbound supplier purchase orders
- plan production and fulfillment
- calculate and communicate promised delivery ETAs
- monitor commercial and operational health through a dashboard

This is not a consumer-facing storefront. It is an internal operational tool used by business users.

### Who Uses It

The primary users are internal Lovold staff involved in:

- order entry
- inventory-aware order planning
- production coordination
- inbound supply monitoring
- customer account visibility
- management reporting

The designer should think of the user as an operations user who works inside tables, status workflows, and detail panels all day. The experience should feel efficient, structured, and business-critical.

### Product Goal

The core goal of the product is:

- manage orders from intake to delivery with visibility into stock, inbound supply, production, and ETA commitments

This means the product is not only about order entry. It is about whether Lovold can fulfill an order, when it can fulfill it, what inventory is tied up, what is still inbound, and what has become delayed.

### Core Business Areas

The product covers these core business areas:

- catalog management
- component management
- customer pricing
- customer orders
- inbound supplier tracking
- ETA planning
- customer management
- dashboard visibility

### Product Positioning For Design

The UI should feel like a lightweight ERP or operations platform:

- information-dense but readable
- status-driven
- operationally transparent
- able to show dependencies between inventory, inbound supply, production, and delivery

It should not look like a simple e-commerce admin screen. The important design challenge is making operational complexity easy to understand.

## 2. Core Product Concepts

This section defines the business concepts the designer must understand before designing screens.

### Product

A product is a base inventory item.

Products:

- can be ordered directly
- are the base unit for customer pricing agreements
- can be used to build components
- have stock, reserved quantity, and category assignment

### Component

A component is a composite sellable item built from one or more base products.

Components:

- behave as a single orderable unit
- are managed in the same broad inventory section as products
- must always be clearly identifiable as components
- can exist as ready-made inventory
- have their own stock and reserved quantity
- have a fixed standard production cost

The important mental model is:

- a product is a base item
- a component is an assembled or prepared item made from products

### Category

A category is a lightweight classification record used to organize inventory items.

Categories apply to:

- products
- components

Categories are not a deep hierarchy. They are a lightweight catalog organization tool.

### Customer

A customer is a commercial account record used for order ownership, pricing visibility, and sales history.

Customers remain lightweight in this phase and are not being expanded into a full CRM model.

### Customer Pricing Agreement

A customer pricing agreement defines product-specific pricing adjustments for a customer.

Important rule:

- customer pricing applies only to base products

Components do not have their own direct pricing agreements. Their pricing is derived from the products inside them.

### Supplier

A supplier is a business entity from whom Lovold purchases base products.

Suppliers matter because inbound stock only enters the business through supplier purchase orders.

### Supplier Purchase Order

A supplier purchase order is an inbound purchasing record for base products.

It is used to understand:

- what products are expected to arrive
- how much quantity is inbound
- when inventory may become available

### Inbound ETA

Inbound ETA is the expected arrival time of supplier purchase orders.

Inbound ETA matters because customer order ETA must consider missing stock and future inbound supply.

### Order

An order is the main transaction and tracking object in the system.

An order must support:

- customer linkage
- product lines and component lines
- lifecycle status tracking
- inventory reservation
- ETA planning
- production tracking
- delivery tracking

### Order Line

An order line is a sellable item inside an order.

An order line can represent:

- a product
- a component

This distinction must be visible and intentional in the UI.

### Production Step

A production step is an order-level activity used to execute work needed for fulfillment.

An order may have:

- no production steps
- one production step
- many production steps

Each production step records operational execution information such as work center, step name, cost, and time taken.

### Work Center

A work center is a simple named operational area or process station used to classify production steps.

Examples:

- rope cutting
- fixing and throwing
- assembly

### Available Stock vs Reserved Stock

This distinction is critical to the whole product.

Stock quantity is not the same as available quantity.

Reserved quantity represents stock already committed to confirmed orders.

Available stock is what can still be used for new orders.

This means:

- reserved stock must not be treated as available
- ETA calculations must use available stock, not total stock
- inventory screens should expose this distinction clearly

### Promised ETA

Promised ETA is the customer-facing committed delivery date for an order.

It is not just a live calculation. It must be stored on the order so the business can:

- track delayed orders
- compare on-time vs late performance
- filter orders by risk and delay

### Relationship Map

The designer should keep the following mental model in mind:

- categories organize both products and components
- components are composed of products
- customer pricing applies to products only
- component pricing is derived from its products plus fixed standard production cost
- orders can contain products or components
- confirming an order reserves inventory
- supplier purchase orders bring in products only
- missing stock pushes the system to look at inbound ETA
- production, QC, packaging, and delivery together shape the promised ETA

## 3. Global UX Rules

### Overall UX Direction

The product should feel like an enterprise admin experience built for daily operations work.

Design principles:

- data-dense but clear
- structured rather than decorative
- optimized for scanning, filtering, and comparing records
- explicit about bottlenecks, dependencies, and risk
- able to support both list-level overview and record-level detail

### Tone Of The Interface

The UI should communicate:

- operational confidence
- control over workflow
- visibility into what is blocked, promised, ready, or delayed

It should not feel lightweight in the sense of being simplistic. It should feel controlled and decision-oriented.

### Global UX Expectations

Across the whole product, the design must make these things obvious:

- the difference between a product and a component
- the difference between stock and available stock
- which orders are on track and which are delayed
- when inbound supply is affecting customer promises
- where production is in progress
- what actions are primary versus secondary

### Placeholder Actions

Some actions may exist visually for continuity even when functionality is intentionally deferred.

This especially applies to areas like Customer Pricing, where edit and delete actions may be shown as placeholders for future evolution.

When placeholder actions are shown, the design should still communicate that the screen is complete and intentional.

### Cross-Cutting Screen States

Every major list or detail screen should have design coverage for:

- loading state
- empty state
- error state
- filtered no-results state

No-permission states are not needed in this phase.

### Cross-Cutting UI Primitives

The designer should assume the product needs repeated, consistent patterns for:

- tables
- drawers or side panels
- dialogs and modals
- summary metric cards
- status badges
- tab-like segmented controls
- inline helper text
- timeline or progress views
- structured detail panels
- breakdown tables for nested information

### Status Design

Statuses are a major part of the product.

The design system should support visually distinct but consistent treatments for:

- order statuses
- supplier purchase order statuses
- agreement statuses
- risk states such as delayed, awaiting materials, low available stock, or high reserved stock

### Inventory Visibility Principle

Any screen that surfaces inventory should, where relevant, clearly distinguish:

- total stock
- reserved stock
- available stock

This distinction is more important than simply showing a single stock number.

### ETA Visibility Principle

ETA must be understandable as a breakdown, not only a single date.

Where ETA is shown in depth, the UI should be able to explain:

- material availability ETA
- production completion ETA
- delivery ETA
- final promised ETA

## 4. Information Architecture And Navigation

The future-state information architecture should be organized like this:

### Primary Navigation

- Dashboard
- Inventory / Catalog
- Sales
- Inbound
- Customers

### Inventory / Catalog

This area contains:

- Products
- Components
- Categories
- Customer Pricing

Products and Components are part of the same broad business area, but must be clearly separated in the interface.

### Sales

This area contains:

- Orders

Orders are the operational center of the product because they connect customers, inventory, components, production, ETA, and delivery.

### Inbound

This area contains:

- Supplier POs / Inbound Tracker

This section provides visibility into future material availability and inbound risk.

### Customers

This area contains:

- Customer Directory
- Customer Detail

### Auth

Login and session gating can remain visually simple and are not a redesign priority in this phase.

### Recommended Navigation Logic

The designer should treat this as a connected operational ecosystem, not as isolated pages.

Important cross-screen journeys:

- Products and Components feed into Orders
- Customer Pricing affects Orders
- Orders depend on inventory and inbound timing
- Inbound affects order ETA
- Orders roll up into the Dashboard
- Customers provide sales and order-history context

## 5. Screen-By-Screen Product Specification

This section describes the screens the designer should create and what each one must accomplish.

## 5.1 Dashboard

### Screen Purpose

The Dashboard is the top-level operational overview for Lovold.

It must answer:

- how the business is performing commercially
- what operational risks exist right now
- which orders need attention
- which inbound or inventory issues threaten commitments

### Primary User Tasks

- review high-level commercial performance
- spot delayed or at-risk orders
- monitor inbound dependencies
- see production and fulfillment pressure
- identify top customers and top sellable items

### Key Content Blocks

- KPI card row
- recent orders panel
- delayed orders panel
- upcoming inbound POs panel
- orders by status panel
- ETA risk panel
- inventory pressure panel
- top customers panel
- top sellable items panel

### KPI Cards

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

The Dashboard should include panels for:

- recent orders
- delayed orders
- upcoming inbound supplier purchase orders
- low available stock items
- orders by status
- ETA risk orders
- top customers
- top sellable items

### Inventory Visibility

The inventory-oriented dashboard view should focus on operationally useful states:

- low available stock
- high reserved stock
- component shortage risk

This is more important than simple low-stock-only reporting.

### Sellable Ranking

Top-item ranking must combine:

- products
- components

The screen should not present a product-only ranking.

### Time Controls

The interface may include `Today`, `Week`, and `Month` controls, but these do not need to be functional in this phase.

### Required States

- loading dashboard
- empty dashboard
- error state
- filtered no-results state if filters are shown

### Major Actions

- navigate to an order
- navigate to the inbound tracker
- navigate to a customer
- navigate to product or component detail

### Relationships To Other Sections

- uses Orders for status and ETA risk
- uses Inbound for supplier PO timing
- uses Products and Components for inventory pressure
- uses Customers for commercial ranking

### Critical Business Rules To Reflect

- delayed orders depend on stored promised ETA
- inventory visibility must be reservation-aware
- top sellable items combine products and components
- inbound timing is part of operational risk visibility

## 5.2 Inventory / Catalog Overview

### Section Purpose

This is the main catalog-management area.

It must support management of:

- products
- components
- categories
- customer pricing

### UX Goal

The designer should make this area feel like one connected catalog and pricing workspace, while still clearly separating item types and tasks.

### Key Design Requirement

Products and Components must feel related, but never visually ambiguous.

## 5.3 Products List Screen

### Screen Purpose

The Products list is the main view for managing base inventory items.

### Primary User Tasks

- browse products
- search by name or SKU
- filter products
- inspect stock and reserved stock
- open product detail
- create a new product
- edit an existing product

### Key Content Blocks

- page header with create action
- search input
- filter controls
- summary cards
- products table
- pagination

### Important Table Information

Each product row should communicate the most useful operational information at a glance, such as:

- SKU
- product name
- category
- selling price
- cost price
- stock quantity
- reserved quantity
- available quantity
- status

### Required States

- loading list
- empty catalog
- no search results
- error

### Major Actions

- create product
- edit product
- view product detail

### Relationships To Other Sections

- products are the base inputs for components
- products are used in orders
- products are used in customer pricing agreements
- products are purchased through supplier POs

### Critical Business Rules To Reflect

- products are base items, not composed items
- customer pricing agreements attach to products only
- available quantity must account for reserved quantity

## 5.4 Product Detail Screen

### Screen Purpose

The product detail view gives a structured operational view of a single base product.

### Primary User Tasks

- understand the product's role in the catalog
- inspect stock and availability
- review category assignment
- view pricing basics
- understand where it may be used operationally

### Key Content Blocks

- product identity block
- status and category
- inventory metrics
- pricing metrics
- descriptive information
- related usage hints where useful

### Recommended Detail Information

- SKU
- name
- category
- description
- product status
- stock quantity
- reserved quantity
- available quantity
- selling price
- cost price

### Major Actions

- edit product
- return to list

### Critical Business Rules To Reflect

- product is the pricing base for customer pricing
- product may be part of one or many components
- product stock can be committed directly by orders or indirectly through component fulfillment

## 5.5 Create And Edit Product Flow

### Flow Purpose

This flow allows the user to create or maintain a base product record.

### Information To Capture

- basic identity
- category
- pricing values
- stock and reorder-related values if included
- status
- description
- image if supported in design

### UX Expectations

- clear form structure
- lightweight validation cues
- confidence around save versus cancel

### Critical Business Rules To Reflect

- products are base items
- product data is later used in pricing, components, orders, and supplier POs

## 5.6 Components List Screen

### Screen Purpose

The Components list is the management view for composite sellable items.

### Primary User Tasks

- browse components
- search and filter components
- inspect ready-made stock and reserved stock
- open component detail
- create or edit a component

### Key Content Blocks

- page header with create action
- search and filter controls
- summary cards
- components table
- pagination

### Important Table Information

Each component row should communicate:

- component code or SKU
- component name
- category
- ready-made stock quantity
- reserved quantity
- available quantity
- standard production cost
- derived selling value or pricing visibility
- status

### Required States

- loading
- empty
- no results
- error

### Major Actions

- create component
- edit component
- view component detail

### Relationships To Other Sections

- components are built from products
- components can be ordered directly
- component availability affects orders
- component pricing depends on base products and standard production cost

### Critical Business Rules To Reflect

- components must be clearly labeled as components
- components are separate entities from products
- available quantity must account for reserved quantity

## 5.7 Component Detail Screen

### Screen Purpose

The component detail screen explains what the component is, how it is built, and how it behaves operationally.

### Primary User Tasks

- understand the composition of a component
- inspect ready-made inventory
- review derived pricing logic
- see standard production cost
- understand product dependencies

### Key Content Blocks

- component identity block
- category and status
- inventory metrics
- standard production cost
- derived pricing summary
- component composition table

### Component Composition Table

This is one of the most important detail views in the system.

The designer should plan a clear breakdown that shows:

- each underlying base product
- quantity required per component unit
- optionally pricing contribution
- optionally stock or availability relevance

### Major Actions

- edit component
- create similar component if useful in design
- return to list

### Critical Business Rules To Reflect

- component pricing is derived from underlying products plus fixed standard production cost
- components can exist as ready-made stock
- if ready-made stock is insufficient, underlying products may be used to fulfill demand

## 5.8 Create And Edit Component Flow

### Flow Purpose

This flow creates or maintains a component definition.

### Information To Capture

- component identity
- component category
- status
- ready-made stock
- reserved quantity where relevant
- standard production cost
- descriptive information
- underlying product composition

### Composition Editing Requirement

The form must allow the user to build a component from one or more base products.

The user should be able to:

- add product rows
- select a base product
- define quantity per product
- remove composition rows

### Critical Business Rules To Reflect

- a component is only valid if it is composed of at least one product
- standard production cost is stored directly on the component
- final component value is not only the sum of the product values

## 5.9 Categories Screen

### Screen Purpose

Categories are a lightweight organization tool for both products and components.

### Primary User Tasks

- browse categories
- search categories
- create categories
- see how many items sit in each category

### Key Content Blocks

- page header
- search
- create category action
- summary cards
- categories table
- pagination

### Required States

- loading
- empty
- no results
- error

### Major Actions

- create category
- inspect category row information

### Critical Business Rules To Reflect

- categories apply to both products and components
- categories remain lightweight
- no hierarchy is needed in this phase

## 5.10 Customer Pricing Screen

### Screen Purpose

The Customer Pricing screen manages customer-specific pricing agreements for base products.

### Primary User Tasks

- browse agreements
- filter by active, future, or expired
- create a new agreement
- understand which products have customer-specific discounts

### Key Content Blocks

- page header
- create agreement action
- status filters
- agreements table

### Important Agreement Information

Each agreement should show:

- customer
- product
- discount percent
- validity range
- derived status

### Required States

- loading
- empty
- no results
- error

### Major Actions

- create pricing agreement
- optional placeholder edit button
- optional placeholder delete button

### Relationships To Other Sections

- affects order pricing for product lines
- affects component pricing indirectly through base products
- may be linked from product or customer context

### Critical Business Rules To Reflect

- customer pricing applies only to products
- components do not have direct pricing agreements
- component pricing visibility comes from the underlying products inside the component

## 5.11 Orders List Screen

### Screen Purpose

The Orders list is the control center for tracking orders from intake to completion.

### Primary User Tasks

- browse and filter orders
- see where each order is in the lifecycle
- spot delayed orders
- inspect promised ETA
- open order detail
- create a new order

### Order Status Model

The order lifecycle must support:

| Status | Meaning |
| --- | --- |
| `draft` | Order is being prepared and not yet committed |
| `confirmed` | Order is accepted and triggers reservation and ETA calculation |
| `reserved` | Materials or finished stock have been reserved |
| `in_production` | Order is actively going through production |
| `ready` | Order is completed and ready for dispatch |
| `dispatched` | Order has left the business |
| `delivered` | Order has reached the customer |
| `cancelled` | Order has been cancelled |

### Key Content Blocks

- page header with create action
- filters and search
- status summary or status counts
- orders table
- delayed or at-risk emphasis

### Important Table Information

Each order row should communicate:

- order number
- customer
- order date
- current status
- total amount
- profit or estimated profit
- promised ETA
- delay state

### Required States

- loading
- empty
- no results
- error

### Major Actions

- create order
- open order detail
- filter by status
- filter delayed orders

### Relationships To Other Sections

- pulls in customers
- uses products and components
- depends on inbound supply when stock is missing
- rolls up into the Dashboard

### Critical Business Rules To Reflect

- order status is operationally meaningful
- delayed state depends on promised ETA
- confirmed orders trigger inventory reservation and ETA storage

## 5.12 Order Detail Screen

### Screen Purpose

The order detail screen is the end-to-end tracking screen for a single order.

It should provide one place to understand:

- what was ordered
- whether stock is reserved
- whether materials are waiting on inbound supply
- what production work has occurred
- what ETA was promised
- whether the order is on track or delayed

### Primary User Tasks

- review full order summary
- inspect order lines
- inspect status progression
- review ETA breakdown
- review production steps
- understand blockers

### Key Content Blocks

- order summary header
- customer summary
- status tracker or timeline
- order lines table
- component breakdown sections where relevant
- ETA breakdown panel
- production steps panel
- delivery planning information
- risk or blocker panel

### ETA Breakdown Panel

This should clearly show:

- material availability ETA
- production completion ETA
- delivery ETA
- final promised ETA

The designer should treat this as a key panel, not as a minor metadata block.

### Production Steps Panel

This should support visibility into zero, one, or many production steps and should show:

- work center
- step name
- description if present
- cost
- time taken
- step status if used

### Major Actions

- change status where workflow supports it
- add or review production steps
- review component breakdown

### Critical Business Rules To Reflect

- promised ETA is customer-facing and stored
- production-step costs are separate from component standard production cost
- inventory reservation is part of order state, not a hidden system action

## 5.13 Create Order Flow

### Flow Purpose

This is one of the most important flows in the product.

It must let the user create an order that is commercially correct and operationally realistic.

### Primary User Tasks

- select a customer
- add order lines
- choose between products and components
- see derived pricing
- manually override pricing if necessary
- see component breakdown
- review ETA inputs
- confirm the order

### Required Structure

The flow should clearly separate:

- order header information
- line-item entry
- pricing and totals
- ETA planning inputs and outputs
- production planning information if relevant

### Line Entry Requirement

The order flow must present product and component selection as two separate choices.

This can be designed as:

- tabs
- segmented controls
- separate add-line actions
- or another very clear dual-path interaction

The experience should not force the user to guess what kind of item they are choosing.

### Component Breakdown Requirement

When a component is chosen, the UI should surface its underlying product breakdown.

This should help the user understand:

- what the component contains
- how it may consume stock
- why pricing looks the way it does

### Pricing Behavior

The order flow must support both:

- derived pricing based on customer pricing rules
- manual override by the user

The UI must make clear whether a value is:

- system-derived
- manually adjusted

### ETA Inputs And Outputs

The flow must support:

- evaluation of material availability
- manual delivery-time input
- stored ETA breakdown

The user should be able to understand why a promised ETA is what it is.

### Confirmation-Time Behavior

When the order becomes confirmed, the system should:

- reserve inventory
- evaluate material availability
- calculate ETA fields
- store the ETA values on the order

The design should make this feel like a meaningful operational commitment.

### Required States

- empty order
- partially filled order
- invalid or incomplete order
- pricing changed by override
- materials unavailable or partly unavailable
- successful confirmation

### Major Actions

- add product line
- add component line
- remove line
- override price or discount
- confirm order
- save draft if included in workflow

### Critical Business Rules To Reflect

- reservation happens on confirmation
- reserved stock is not available stock
- component pricing includes underlying product pricing plus standard production cost
- promised ETA must reflect stock, inbound, production, QC, packaging, and delivery

## 5.14 Inline Component Creation From Order Flow

### Flow Purpose

This flow supports a specific operational scenario:

- the customer needs a component
- ready-made component stock is not available
- the underlying products do exist

The user should be able to create a component directly from the order context instead of leaving the order flow.

### Primary User Tasks

- define a new component on the fly
- select its underlying products
- define composition quantities
- optionally save it for future use
- continue the order without losing context

### Key Content Blocks

- component identity fields
- category
- standard production cost
- composition editor
- save-for-future option

### Critical Business Rules To Reflect

- inline-created components are real component definitions
- the user must have the option to save them for future reuse
- the flow should feel embedded in the order workflow, not like a disconnected admin task

## 5.15 Production Steps In Order Flow

### Screen Or Panel Purpose

Production tracking is part of the order flow, not a separate production module in this phase.

### Primary User Tasks

- add production steps to an order
- assign work centers
- capture cost and time taken
- understand actual production effort

### Required Information Per Step

- work center
- step name
- description optional
- cost
- time taken
- status optional

### Fixed Lead Items

Quality checks and packaging are not freeform production steps in this phase.

They should be treated as fixed business-level lead items that are included in ETA planning.

### Critical Business Rules To Reflect

- production steps are order-level, not line-level
- production-step costs are operational actuals
- production-step costs must stay separate from component standard production cost

## 5.16 Inbound Tracker / Supplier Purchase Orders List Screen

### Screen Purpose

This screen provides visibility into all inbound purchase orders placed with suppliers.

It is the main screen for understanding future material availability.

### Primary User Tasks

- browse supplier purchase orders
- see expected arrival timing
- inspect status
- understand which inbound records may unblock orders

### Supplier PO Status Model

| Status | Meaning |
| --- | --- |
| `draft` | Not yet placed |
| `ordered` | Placed with supplier and awaiting receipt |
| `partially_received` | Some quantity has been received |
| `received` | Fully received |
| `cancelled` | Cancelled and no longer expected |

### Key Content Blocks

- page header
- filters and search
- supplier visibility or supplier filter
- supplier PO table
- arrival ETA emphasis

### Important Table Information

Each supplier PO row should communicate:

- PO number
- supplier
- status
- arrival ETA
- quantity summary if useful
- risk or urgency state if useful

### Required States

- loading
- empty
- no results
- error

### Major Actions

- open PO detail
- filter by status
- filter by supplier

### Relationships To Other Sections

- inbound timing affects Orders and ETA
- supplier POs bring in products for the catalog
- Dashboard surfaces upcoming inbound POs

### Critical Business Rules To Reflect

- supplier POs are for products only
- arrival ETA matters for customer promise planning

## 5.17 Supplier Purchase Order Detail Screen

### Screen Purpose

The PO detail screen explains the inbound order at header and line level.

### Primary User Tasks

- review supplier and ETA information
- inspect line quantities
- understand partial receipt progress

### Key Content Blocks

- PO summary header
- supplier information
- status and arrival ETA
- PO items table

### PO Items Table

Each line should show at minimum:

- product
- ordered quantity
- received quantity
- remaining quantity

### Major Actions

- review receipt progress
- return to list

### Critical Business Rules To Reflect

- header-level ETA is sufficient for now
- line-level quantity tracking is required
- the earliest date when the full required quantity becomes available matters more than a simple first-arrival date

## 5.18 Customers Directory Screen

### Screen Purpose

The Customers directory provides a commercial view of the customer base.

### Primary User Tasks

- browse customers
- search customers
- filter by status or region
- review customer performance
- open customer detail

### Key Content Blocks

- page header
- search
- filters
- summary cards
- customers table

### Important Table Information

Each customer row should show:

- customer code
- customer name
- contact details
- region or country
- order count
- revenue
- last order date
- status

### Required States

- loading
- empty
- no results
- error

### Major Actions

- open customer detail

### Critical Business Rules To Reflect

- this remains a lightweight account area
- customer metrics are derived from orders and order items

## 5.19 Customer Detail Screen

### Screen Purpose

The Customer detail view is a commercial summary screen for one customer.

### Primary User Tasks

- review sales performance for the customer
- inspect order history
- understand relationship value

### Key Content Blocks

- customer summary block
- status
- commercial metrics
- order history table

### Important Metrics

- total orders
- total sales
- estimated profit
- items purchased

### Major Actions

- navigate to related orders if useful

### Critical Business Rules To Reflect

- customer metrics are derived, not maintained as separate master data
- customer scope stays lightweight in this phase

## 5.20 Login And Session Screens

### Screen Purpose

The product has login and session gating, but auth is not an active redesign priority in this phase.

### Design Direction

Keep these screens simple, clear, and consistent with the rest of the product, without investing disproportionate design effort.

## 6. Cross-Screen Business Rules

These are fixed business rules the designer should not reinterpret.

### Pricing Rules

- customer pricing applies only to products
- components do not have separate customer pricing agreements
- component pricing is derived from constituent product pricing plus fixed standard production cost
- order pricing may still be manually overridden by the user

### Inventory Rules

- reserved stock is not available stock
- products and components both carry stock quantity and reserved quantity
- available stock must be treated as the usable quantity for new orders
- reservation happens when an order becomes confirmed

### Component Fulfillment Rules

- components may exist as ready-made stock
- when a component is confirmed on an order, ready-made component stock is used first
- if ready-made component stock is insufficient, the remaining requirement must use underlying product availability
- component composition is therefore operationally important, not just descriptive

### Inbound Rules

- supplier purchase orders are for products only
- supplier purchase orders must include arrival ETA
- supplier purchase order lines must track ordered, received, and remaining quantity
- inbound planning must use the earliest date at which the full required quantity becomes available

### ETA Rules

- every order stores `materialAvailabilityEta`
- every order stores `productionCompletionEta`
- every order stores `deliveryEta`
- every order stores `promisedEta`
- promised ETA is the customer-facing committed date
- delayed-order tracking depends on stored promised ETA

### Production Rules

- order production steps are order-level only in this phase
- each production step captures work center, step name, optional description, cost, time taken, and optional status
- QC and packaging are fixed business lead items, not freeform production-step records
- order production-step costs must remain separate from component standard production cost

## 7. Frontend Data And Object Concepts The Design Must Reflect

This section translates the required future-state model into plain language for design.

### Separate Item Types

The design must reflect that products and components are separate entities with different meanings.

This should be visible in:

- navigation
- list screens
- detail screens
- order-entry choices
- labels and badges

### Generic Order Lines

Orders no longer contain only products.

The design must account for order lines that can represent either:

- a product
- a component

The user should never be forced to infer this implicitly.

### Reserved Quantity

Both products and components need to surface:

- stock quantity
- reserved quantity
- available quantity

This should be a first-class design concern in inventory-aware screens.

### Supplier Purchase Orders And PO Items

The design must support:

- supplier PO headers with ETA and status
- supplier PO line items with ordered, received, and remaining quantities

### Order Production Steps

The design must support a repeatable list of production steps attached to an order.

### Work Center List

Work centers are a simple selectable list for now, not a large management module.

### Stored ETA Breakdown

The design must account for a stored ETA breakdown on orders:

- material availability ETA
- production completion ETA
- delivery ETA
- promised ETA

### Top Sellable Items

Dashboard ranking and commercial visibility must combine:

- products
- components

This should be treated as a sellable-item view rather than a product-only view.

## 8. Fixed Decisions The Designer Should Not Reopen

These decisions have already been made and should be treated as fixed constraints during design exploration.

- Products and Components live in the same broad inventory section.
- Components must be clearly identified as components.
- Categories apply to both products and components.
- Customer pricing applies only to products.
- Components derive pricing from their underlying products plus fixed standard production cost.
- Orders must support both products and components.
- Product and component selection in orders must be separate choices.
- Component breakdown must be visible in the order flow.
- Users must be able to override pricing manually in orders.
- Inventory reservation happens when an order becomes confirmed.
- Reserved inventory must not count as available.
- Components may use ready-made stock first, then underlying products if needed.
- Users must be able to create a component from the order flow and optionally save it for future use.
- Orders must support zero or many order-level production steps.
- QC and packaging are fixed business lead items.
- Supplier POs are product-only.
- ETA must be stored on the order, not only calculated live.
- The Dashboard must combine commercial and operational visibility, including delayed orders and inbound dependency.
- The product remains frontend-only and mock-data-driven in this phase.

## 9. Acceptance Checklist For Designer Handoff

The design handoff is complete only if the designer can answer all of the following without opening the codebase:

- What business problem the product solves
- Who the main internal users are
- What each primary section does
- How Products differ from Components
- How Customer Pricing works
- How Orders move from intake to delivery
- When stock becomes reserved
- How inbound supply affects order ETA
- Why promised ETA must be stored
- What production steps represent
- What screens are required
- What content each screen needs
- What states and status variants need design coverage
- Which product decisions are fixed and should not be reinvented

## 10. Final Design Goal

The finished design should help Lovold users answer three questions quickly:

- What can we sell or promise right now?
- What is blocking or delaying fulfillment?
- What operational action should we take next?

If the design makes those answers obvious across Dashboard, Inventory, Orders, Inbound, and Customers, it is aligned with the product direction.
