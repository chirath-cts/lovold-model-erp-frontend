# Prompt 07: Create Order, ETA Planning, And Production

Paste this after the Orders list/detail prompt.

```md
Continue the Lovold ERP project and keep the same established design language.

Now design the create-order experience in detail.

This is a desktop-first internal ERP flow and should be designed as a serious operational workflow, not a lightweight shopping-cart form.

Critical business rules:

- Order lines can be either products or components.
- Product and component selection must be presented as two separate choices.
- When a component is selected, the user should see its underlying product breakdown.
- Manual pricing override must remain available.
- Inventory reservation happens when the order becomes confirmed.
- Reserved stock is not available stock.
- ETA depends on material availability, production time, fixed quality-check lead time, fixed packaging lead time, and manual delivery time.
- The order stores:
  - material availability ETA
  - production completion ETA
  - delivery ETA
  - promised ETA

Use domain-relevant sample content for order entry. Example product or component lines can include:

- oxygen sensor kit
- barge control panel
- feed line coupling set
- cage distribution manifold
- feed blower unit
- retrofit monitoring bundle
- pneumatic pipeline assembly

Design the full create-order workflow with these parts:

1. Order header area
2. Customer selection
3. Line-entry workspace
4. Product-line path
5. Component-line path
6. Pricing and totals area
7. ETA planning area
8. Production planning area
9. Order confirmation state

The line-entry workspace should make it very clear whether the user is adding:

- a product
- a component

When a component is selected, show:

- component identity
- breakdown of underlying products
- pricing explanation or cost explanation where useful
- stock and availability context if appropriate

Design manual pricing override in a way that clearly distinguishes:

- system-derived values
- user-overridden values

Also design an inline component-creation flow inside the order experience for this case:

- the user needs a component
- ready-made component stock is not available
- underlying products exist
- the user wants to create the component from inside the order flow

The inline component-creation flow should include:

- component identity
- category
- standard production cost
- composition editor
- option to save for future use

Also design order-level production-step UI inside or attached to the order flow.

Production-step requirements:

- work center allocation
- step name
- optional description
- cost
- time taken
- optional step status

Work centers are a simple selectable list for now.

Use realistic work-center examples such as:

- panel assembly
- hose cutting
- manifold assembly
- electrical wiring
- sensor calibration
- bench testing
- mechanical fitting

Quality checks and packaging are fixed business lead items, not freeform production steps. The UI should make that distinction clear.

Design this flow to feel robust, structured, and transparent about what happens when an order is confirmed.
```
