# Prompt 01: Project Seed Brief

Paste the prompt below into Stitch to establish the overall product direction.

```md
Design a desktop-first internal ERP web application called Lovold ERP.

This is an internal operations product, not a customer-facing storefront. The users are Lovold staff who manage orders, inventory-aware planning, inbound supply, production coordination, ETA commitments, and customer visibility.

Lovold is a Norwegian engineering and technology company serving the aquaculture industry, especially large-scale fish farming such as salmon production. This is a B2B industrial environment where reliability, efficiency, and operational visibility matter.

Create a high-fidelity product direction for the app with a serious operational feel:

- data-dense but clear
- status-heavy
- enterprise admin style
- operationally transparent
- built for daily use by internal business users

The product must cover these areas:

- Dashboard
- Inventory / Catalog
- Products
- Components
- Categories
- Customer Pricing
- Orders
- Inbound Tracker / Supplier Purchase Orders
- Customers

Use domain-relevant example content throughout the design. The app should look like it belongs to an aquaculture technology and engineering company that sells and supports:

- feeding systems
- feed barges
- pneumatic feed transport equipment
- pipe systems
- electrical and control panels
- sensor and monitoring hardware
- retrofit packages
- spare parts and service kits

Important domain concepts:

- Products are base inventory items.
- Components are composite sellable items built from one or more products.
- Products and Components live in the same broad inventory area, but must always be visually distinguishable.
- Customer pricing applies only to products.
- Component pricing is derived from the underlying products plus fixed standard production cost.
- Orders can contain either product lines or component lines.
- Reserved stock is not available stock.
- Confirming an order reserves inventory and stores ETA fields.
- ETA depends on material availability, production, quality check, packaging, and delivery.
- Inbound supplier purchase orders affect order ETA when materials are missing.

If example customers, products, orders, suppliers, categories, or imagery are used, make them feel specific to Lovold's aquaculture domain instead of generic software or consumer-commerce examples.

Create the initial product concept with:

- overall visual direction
- left-side navigation structure
- top app bar behavior
- page header pattern
- status badge language
- data-table tone
- summary card tone
- detail-panel tone

The app should feel modern and highly usable, but not flashy. It should feel trustworthy, structured, and built for operational decision-making.

Do not design the full product yet. Focus on creating the shared product direction and the foundational visual identity for the Lovold ERP experience.
```
