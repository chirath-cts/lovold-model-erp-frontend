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

## Project Structure Rules

### Screens
- Each screen is located in `/screens/<screen-name>/`
- Always refer to:
  - `screen.png` → visual design
  - `code.html` → layout reference
  - Use /ai/ai-screen.md as the common screen implementation guide

---

### Mock + Services (IMPORTANT)

#### ALWAYS use services layer (DO NOT access mockDb directly)

Example:
```ts
import { ordersService } from "@/services/endpoints/ordersService";

const orders = await ordersService.getList();