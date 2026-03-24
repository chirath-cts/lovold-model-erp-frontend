# Stitch Prompt Pack

This directory contains paste-ready prompts for designing Lovold ERP incrementally in Google Stitch.

## Recommended Usage

Use these prompts in order and keep everything inside the same Stitch project or canvas so the tool retains design continuity.

Recommended order:

1. `00-session-bootstrap.md`
2. `00a-lovold-domain-context.md`
3. `01-project-seed-brief.md`
4. `02-design-system-and-app-shell.md`
5. `02a-login-screen.md`
6. `03-products-and-components.md`
7. `04-categories.md`
8. `05-customer-pricing.md`
9. `06-orders-workspace-list-detail.md`
10. `07-order-creation-eta-production.md`
11. `08-inbound-tracker-supplier-pos.md`
12. `09-customers.md`
13. `10-dashboard.md`
14. `11-flow-polish-and-unification.md`

## Best Workflow

- Start a new Stitch project for Lovold ERP.
- Paste Prompt 00 first to establish continuity instructions for the session.
- Paste Prompt 00a next to anchor the project in Lovold's aquaculture domain.
- Paste Prompt 01 after that to establish the product concept.
- Paste Prompt 02 after that to lock the shared shell, navigation, and reusable UI language.
- Paste Prompt 02a next if you want Stitch to design the login screen in the same visual language.
- Then continue section by section.
- After each section, review the results before moving to the next prompt.
- Keep asking Stitch to preserve the same visual language, spacing system, status treatment, and component patterns.

## Important Notes

- This is a desktop-first internal ERP product.
- The design should be responsive, but not mobile-first.
- The product is frontend-only and mock-data-driven for now.
- Do not ask Stitch to design every screen in one pass.
- For best consistency, keep referencing the same concepts:
  - products vs components
  - available stock vs reserved stock
  - inbound dependency
  - stored ETA breakdown
  - operational status visibility
- Use domain-relevant sample content:
  - aquaculture equipment
  - feed systems
  - monitoring hardware
  - industrial control systems
  - salmon farming operators
  - marine and offshore service context

## Optional Reference Attachment

If Stitch supports attaching or pasting a supporting document once at the beginning, use:

- [ui-designer-product-spec.md](/home/isuruc/development/lovold/erp/lovold-model-erp-frontend/agent-docs/ui-designer-product-spec.md)

But still use the prompts in this folder incrementally rather than asking Stitch to generate the whole product from the full spec in one shot.
