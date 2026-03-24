# AI Rules – ERP Prototype (React + Vite + TypeScript + Tailwind)

## Purpose
This project is a **UI prototype for client presentation**, not a production system.

Focus on:
- Speed
- Visual quality
- Simplicity
- Readability

Avoid:
- Over-engineering
- Complex architecture
- Unnecessary abstractions

---

## Tech Stack
- React (Vite)
- TypeScript
- Tailwind CSS

---

## Workflow:
- check existing services first
- check existing mock data first
- if missing, create suitable mock JSON in /mock/data
- if needed, create a simple service in /services/endpoints
- then implement the page in React + Vite + TypeScript + Tailwind CSS

---

## Project Structure Rules

### Screens
- Each screen is located in `/agent-docs/example-ui-designs/<screen-name>/`
- Always refer to:
  - `screen.png` → visual design
  - `code.html` → layout reference 

---

### Mock + Services (IMPORTANT)

#### ALWAYS use services layer (DO NOT access mockDb directly)

Example:
```ts
import { ordersService } from "@/services/endpoints/ordersService";

const orders = await ordersService.getList();