# Data Model and API

## Active Phase 1 Tables
- `customers`
- `categories`
- `products`
- `orders`
- `order_product`
- `customer_product`
- `users`

## Deferred / Inactive for Phase 1
- `suppliers`
- `supplier_product`
- `inventory`
- `warehouses`
- `order_status_history`

## Database Notes
- SQLite foreign keys are enforced
- Supporting indexes exist for Phase 1 core relations
- Order line snapshots preserve historical pricing/cost integrity

## Frontend Compatibility Mapping
- `/orderItems` <-> `order_product`
- `/discounts` <-> `customer_product`
- `/customer-products` <-> `customer_product`
- `/productCategories` <-> `categories`

Canonical category endpoint:
- `/categories`

## Primary Frontend Resources
- `/categories`
- `/productCategories`
- `/products`
- `/customers`
- `/orders`
- `/orderItems`
- `/customer-products`
- `/discounts`
- `/users`

## Supported Query Behavior
- Filtering: `status`, `customerId`, `categoryId`, `orderId`
- Search: `q` for products
- Sorting: `_sort`, `_order` using allowlisted sortable columns

## Seed Coverage
Seed data includes:
- customers
- categories
- products
- orders
- order_product
- customer_product
- users

Excluded or inert for forward compatibility:
- supplier
- warehouse
- inventory
- status history