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

## Entity Relationships (Phase 1)
- `orders.customer_id` -> `customers.customer_code`
- `order_product.order_id` -> `orders.id`; `order_product.product_id` -> `products.id`
- `products.category_id` -> `categories.id`
- `customer_product.customer_id` -> `customers.customer_code`; `customer_product.product_id` -> `products.id`
- `users` stand alone (ops accounts)

## Field Highlights
- `orders.order_number` is unique; monetary totals include subtotal, discount_total, cost_total, profit_total, grand_total
- `order_product` stores quantity, unit_price, line_discount_percent, discount_amount, tax_total, unit_cost_at_sale, profit_amount
- `customer_product` composite on (customer_id, product_id); captures discount_percent, start_date, end_date, is_active for pricing validity
- `products` include base_price, `uom`, and nullable `image_url`
- `customers` use `customer_code` as primary key; referenced by orders and customer_product

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

Product payload note:
- `/products` includes additive optional field `imageUrl` mapped from DB column `products.image_url`

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
