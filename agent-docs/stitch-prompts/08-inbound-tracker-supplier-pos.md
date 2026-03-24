# Prompt 08: Inbound Tracker And Supplier Purchase Orders

Paste this after the Orders prompts.

```md
Continue the Lovold ERP project and preserve the same operational design language.

Now design the Inbound section for supplier purchase orders and inbound tracking.

This section exists because customer order ETA may depend on inbound materials when stock is missing.

Critical business rules:

- Supplier purchase orders are for products only, not components.
- Supplier purchase orders must show arrival ETA.
- Supplier purchase orders use these statuses:
  - draft
  - ordered
  - partially_received
  - received
  - cancelled
- Supplier PO lines must track:
  - ordered quantity
  - received quantity
  - remaining quantity
- When planning order ETA, the business cares about the earliest date when the full required quantity becomes available, not just the first inbound date.

Use realistic inbound examples for an aquaculture engineering business, such as:

- marine-grade valves
- industrial blowers
- stainless pipe sections
- sensor hardware
- PLC components
- control cabinet parts
- cable harnesses
- filtration modules

Design these screens:

1. Inbound Tracker / Supplier PO list screen
2. Supplier PO detail screen

The list screen should support:

- page header
- supplier visibility or supplier filter
- status filter
- search if useful
- arrival ETA visibility
- table layout optimized for scanning inbound risk

Each supplier PO row should communicate:

- PO number
- supplier
- status
- arrival ETA
- quantity summary if useful

The detail screen should communicate:

- PO summary
- supplier information
- status
- header ETA
- line items table

The line items table should clearly show:

- product
- ordered quantity
- received quantity
- remaining quantity

This section should visually connect to the order-planning model. It should feel like a practical inbound-control screen, not a generic procurement page.
```
