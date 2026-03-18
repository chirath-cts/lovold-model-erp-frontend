# Coding Rules

## General
- Prefer minimal, high-confidence changes.
- Reuse existing patterns before introducing new abstractions.
- Keep naming aligned with current repo conventions.

## Frontend
- Use MUI-first components.
- Use React Query for server state.
- Use React Hook Form + Zod for forms when applicable.
- Keep SCSS limited to custom styling needs. 

## UI Styling Rules (MUI + sx usage)

### sx Usage Limit
- Keep `sx` usage minimal and readable.
- If an element has more than **3 style properties inside `sx`**, extract it into a dedicated component.

### When to Extract
Extract into a new component when:
- `sx` contains more than 3 properties
- styles are reused
- styles reduce readability of JSX
- layout + styling are tightly coupled

### How to Extract
- Create a new component in the same file
- Move styling into the new component
- Use either:
  - `styled()` from MUI, or
  - a wrapper component with `sx`