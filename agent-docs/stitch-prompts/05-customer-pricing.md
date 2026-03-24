# Prompt 05: Customer Pricing

Paste this after Categories.

```md
Continue the Lovold ERP project and keep the same shell and design system.

Now design the Customer Pricing section.

This section manages customer-specific pricing agreements for base products only.

Critical business rules:

- Customer pricing applies only to products.
- Components do not have direct pricing agreements.
- Component pricing visibility comes from the underlying base products inside the component.
- Edit and delete functionality are not required right now, but placeholder actions may exist if useful for UI continuity.

Design the Customer Pricing screen with:

- page header
- create agreement action
- status filter controls
- agreements table
- empty and no-results states

Agreement fields to surface clearly:

- customer
- product
- discount percent
- start date
- end date
- derived status

Use domain-relevant sample customers and products, such as aquaculture operators, salmon-farming groups, barge-upgrade programs, sensor packages, feed-system parts, and control hardware.

Prefer realistic fictional customer examples such as:

- FjordBlue Salmon
- NorthSea Aquaculture
- Arctic Crest Farming
- Patagonia Fish Systems
- Highland Cage Operations

Status concepts should include:

- active
- future
- expired

The screen should feel operational and table-driven. The user should quickly understand which customers have product-specific pricing and whether an agreement is currently active.
```
