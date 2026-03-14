# Lovold ERP MVP (Phase 1)

## 📌 Project Overview

This project is a frontend-first ERP MVP prototype being developed for **Lovold**, a company operating in the aquaculture technology domain.

The goal of this MVP is to demonstrate how Lovold can manage:

- Products & Inventory
- Customer-specific pricing (Discounts)
- Sales Orders
- Customer Data
- Business Performance Dashboard

This MVP is NOT a full ERP system.  
It is a **simulation of core ERP workflows using dummy data**, intended to:

- Validate product direction with stakeholders
- Demonstrate operational value
- Establish UI/UX and architecture foundations
- Enable iterative phased development toward a full ERP

---

## 🎯 Phase 1 Objectives

Phase 1 focuses on delivering a **thin but realistic operational slice** of the ERP.

The MVP must allow users to:

- View business performance on a Dashboard
- Manage product inventory
- Define customer-specific discounts
- Create and manage sales orders
- Track customers and their order history
- See stock reduction immediately after order creation
- View estimated profit using fixed product cost

The system must feel **interactive, believable, and enterprise-ready**, even though backend logic is simulated.

---

## 🧩 Domain Context (Aquaculture ERP)

Lovold operates in a B2B industrial environment supplying equipment and systems such as:

- Feeding system components
- Sensors and monitoring devices
- Mechanical and control equipment
- Infrastructure hardware

Typical ERP needs include:

- Inventory tracking
- Customer pricing flexibility
- Order lifecycle tracking
- Profit visibility
- Operational dashboards

This MVP reflects those business realities.

---

## 🏗 Tech Stack

- React
- Vite
- Tailwind CSS
- Material UI
- JSON Server (mock backend)
- Dummy seed data

---

## 🎨 Design System

### Brand Colors

Primary: `#00526C`  
Secondary: `#005671`  
Background: `#FFFFFF`  
Text: Dark neutral gray / black  

### UI Principles

- Clean Scandinavian SaaS style
- High readability
- Consistent spacing grid
- 8px border radius
- Soft shadows
- Status badges and chips
- Minimalistic charts
- Consistent table patterns
- Modal-driven workflows

All screens must feel like part of a **single ERP product**, not isolated pages.

---

## 🧭 Navigation Structure
Dashboard
Inventory
├── Products
├── Categories
└── Discounts
Sales
└── Orders
Customers


---

## 📊 Module Breakdown

---

### 1. Dashboard

Provides business visibility.

Features:

- KPI Cards
  - Total Sales
  - Total Orders
  - Estimated Profit
  - Low Stock Items
  - Active Customers

- Time Filters
  - Today
  - Week
  - Month

- Charts
  - Sales trend
  - Orders by status
  - Top products

- Panels
  - Recent orders
  - Low stock list
  - Top customers

---

### 2. Inventory

#### Products

- Product Code
- Name
- Category
- Selling Price
- Fixed Cost Price
- Stock Quantity
- Stock Status (Healthy / Low / Critical)
- Assigned Discounts

Behavior:

- Stock reduces **immediately when order is saved**

#### Categories

- Organize products logically
- Used for filtering and reporting

#### Discounts

Supports **customer-specific discounts**.

Fields:

- Discount Type (percentage / fixed)
- Value
- Applies to Product or Category
- Assigned Customer
- Validity Period
- Status

Discount selection is **manual during order creation**.

---

### 3. Sales

#### Orders

- Order lifecycle
  - Draft
  - Confirmed
  - Dispatched
  - Delivered

- Order contains multiple order items.

#### Order Creation Modal

Fields:

- Customer selector
- Product selector
- Quantity
- Unit price auto-fill
- Discount selector (filtered by customer)
- Line totals
- Profit summary

Behavior:

- Saving an order:
  - Reduces product stock immediately
  - Updates dashboard metrics

#### Profit Formula
Line Profit = (Selling Price - Discount - Fixed Cost) × Quantity
Order Profit = Sum of Line Profits


---

### 4. Customers

#### Customer List

- Customer Code
- Company Name
- Contact Person
- Country
- Total Orders
- Total Sales
- Last Order Date
- Status

#### Customer Detail Page

- Customer Summary
- Commercial Metrics
- Order History Table

---

## 🗃 Data Model (Mock JSON Server)

Collections:

- products
- categories
- customers
- discounts
- orders
- orderItems

Important Design Decision:

Order items store **price and cost snapshot** so historical orders remain stable even if product pricing changes later.

---

## 🔗 Module Interaction

- Orders use Products and Customers
- Discounts depend on Customer selection
- Orders reduce Product stock
- Dashboard reads from Orders, Products, Customers
- Low stock indicators come from product thresholds

---

## 🚧 Phase Strategy

### Phase 1 (Current)

Frontend simulation:

- Core modules
- Basic workflows
- Realistic dummy data
- UI/UX validation

### Phase 2 (Planned)

- Order approval workflows
- Stock threshold alert engine
- Customer interaction tracking
- Advanced reporting filters
- Purchase planning simulation

### Phase 3 (Planned)

- Backend service layer
- Authentication and roles
- Real profit calculations
- Integration readiness

### Final MVP Goal

- Full ERP-lite system
- Inventory + Sales + CRM + Reporting
- Scalable architecture
- API-driven backend
- Production-ready UX

---

## 🧠 Development Philosophy

- Keep components reusable
- Maintain consistent layout patterns
- Avoid over-engineering early
- Prioritize believable interactions
- Simulate real business logic even with dummy data
- Focus on demo storytelling value

---

## 🎬 Demo Flow (Stakeholder Pitch)

1. Open Dashboard → show KPIs
2. Navigate to Products → explain stock health
3. Show Customer-specific Discounts
4. Open Customer Profile → show order history
5. Create Order → apply discount
6. Save Order → stock reduces immediately
7. Return to Dashboard → KPIs updated

This demonstrates the ERP value clearly.

---

## ✅ Success Criteria for Phase 1

- Stakeholders understand workflow
- UI feels like real enterprise product
- Data interactions feel realistic
- System appears scalable
- Approval obtained for next phase

---
