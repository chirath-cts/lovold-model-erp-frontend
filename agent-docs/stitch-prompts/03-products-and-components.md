# Prompt 03: Products And Components

Paste this after the shell and design-system prompts.

```md
Continue the Lovold ERP project and preserve the same shell, navigation, and component language.

Now design the Inventory / Catalog area for Products and Components.

This section must manage both item types in one broader inventory area, but Products and Components must always be clearly distinguishable.

Business rules:

- Products are base inventory items.
- Components are composite sellable items built from one or more products.
- Categories apply to both products and components.
- Components can exist as ready-made inventory.
- Both products and components have stock quantity and reserved quantity.
- Available quantity must be visually understandable.
- Components also have fixed standard production cost.
- Component pricing is derived from underlying products plus standard production cost.

Use aquaculture-engineering sample content for this section. Example product and component families can include:

- feed blower units
- dosing valves
- feed line couplings
- silo filter modules
- control cabinets
- oxygen sensor kits
- cage sensor nodes
- distribution manifolds
- pipeline assemblies
- retrofit monitoring bundles
- service kits for feed barges

Design these screens:

1. Products list screen
2. Product detail screen
3. Create/edit product flow
4. Components list screen
5. Component detail screen
6. Create/edit component flow with composition editor

Products list should support:

- search
- filtering
- summary cards
- data table
- stock visibility
- reserved stock visibility
- available stock visibility

Product detail should clearly show:

- identity
- category
- pricing basics
- stock
- reserved stock
- available stock
- description and status

Components list should clearly show:

- that these are components, not products
- category
- ready-made stock
- reserved stock
- available stock
- standard production cost
- derived pricing visibility

Component detail should clearly show:

- identity
- category
- inventory state
- standard production cost
- composition breakdown
- underlying products with quantity per component unit

The component composition editor is important. Design a clean, structured UI for:

- adding underlying products
- selecting product rows
- defining quantity per product
- removing rows

Keep the experience enterprise-grade, not simplistic. Use the established design system and make the distinction between products and components obvious at every key touchpoint.

If category examples are shown, use domain-relevant categories such as:

- Feeding Systems
- Mechanical Installations
- Pipe Systems
- Electrical and Control
- Sensors and Monitoring
- Spare Parts
- Service Kits
- Retrofit Packages
```
