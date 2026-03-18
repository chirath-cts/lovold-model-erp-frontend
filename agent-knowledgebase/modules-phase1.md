
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
- Category
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
- Customer-product pricing/discount agreements
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
- Multi-line order items
- Product selection and quantity
- Discount type/value per line
- Live subtotal/discount/total/profit summary

Write flow:
1. Create order
2. Create order items
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