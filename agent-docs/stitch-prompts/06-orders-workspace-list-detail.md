# Prompt 06: Orders Workspace, List, And Detail

Paste this after Customer Pricing.

```md
Continue the Lovold ERP project and preserve the same app shell, typography, spacing, and status language.

Now design the main Orders workspace with the orders list screen and the order detail screen.

Orders are the operational center of the product. This section must connect customers, products, components, reservation-aware inventory, production, ETA, and delivery.

Use domain-relevant example orders. These should feel like high-value B2B aquaculture and engineering orders, for example:

- feeding system upgrade
- sensor retrofit package
- control cabinet replacement
- spare parts replenishment for a feed barge
- cage distribution assembly order
- project-based installation package

Order status model:

- draft
- confirmed
- reserved
- in_production
- ready
- dispatched
- delivered
- cancelled

Design these screens:

1. Orders list screen
2. Order detail screen

Orders list should support:

- page header with create order action
- filters and search
- status-driven organization
- visible promised ETA
- delayed-order visibility
- table-driven scanning

Important order row information:

- order number
- customer
- order date
- status
- total
- estimated profit
- promised ETA
- delayed state

The order detail screen should feel like the end-to-end tracking hub for one order.

It should clearly show:

- order summary
- customer summary
- status progression or timeline
- order lines
- component breakdown where relevant
- ETA breakdown
- production steps
- operational blockers or risk indicators

Important ETA fields to surface clearly:

- material availability ETA
- production completion ETA
- delivery ETA
- promised ETA

Important business rules:

- promised ETA is stored and customer-facing
- delayed order visibility depends on stored promised ETA
- confirmed orders trigger reservation and ETA planning
- reserved stock should be treated as a visible operational state
- production-step costs are separate from component standard production cost

Make this section feel highly operational and status-driven. This should be one of the most information-rich areas in the product.

If line-item examples are shown, use realistic industrial item names rather than generic store products.
```
