
# All feature/module behavior goes here.

Use this:

```md
# Phase 1 Modules

## Navigation
- Dashboard
- Inventory
  - Products
  - Categories
  - Customer Pricing
- Sales
  - Orders
- Customers

## Dashboard
Implemented:
- KPI cards: Total Sales, Total Orders, Estimated Profit, Active Customers
- Charts: Sales trend, Orders by status
- Panels: Recent orders, Top customers, Top products

Not included in Phase 1:
- Time-scope filters
- Stock/low-inventory KPIs

## Inventory

### Products
Implemented:
- Product name
- SKU
- Category (category_id link)
- Base selling price
- Unit of measure
- Product status
- Description

### Categories
Implemented:
- Category list
- Create category via modal/dialog

### Customer Pricing
Implemented:
- Customer-product pricing/discount agreements stored in `customer_product` (customer_id, product_id)
- Discount percent
- Validity start/end dates
- Active flag
- Filtering by active validity window in order flow

Current rules:
- Simple agreement model only
- No discount stacking
- No campaign engine

## Sales

### Orders List
Implemented:
- Status filter
- Revenue/profit/active order summaries
- Orders table with status, totals, and profit

### Create Order Flow
Implemented:
- Customer selection
- Multi-line order lines stored in `order_product`
- Product selection and quantity
- Discount type/value per line
- Live subtotal/discount/total/profit summary
- Order lines persist quantity, unit_price, line_discount_percent, tax_total, unit_cost_at_sale, profit_amount

Write flow:
1. Create order
2. Create order_product rows
3. Refresh affected views via query invalidation

Failure handling:
- Compensating rollback logic on partial write failures

Profit behavior:
- Line profit is calculated and stored
- Order profit is calculated and stored
- Default order status on save: `confirmed`

## Customers

### Customer Directory
Implemented:
- Customer code
- Company
- Contact
- Country
- Status
- Derived order count
- Total sales
- Last order date

### Customer Detail
Implemented:
- Customer summary block
- Aggregated commercial metrics
- Order history table
