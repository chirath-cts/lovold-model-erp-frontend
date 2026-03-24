# Styling Guidelines

This project now uses Tailwind as the frontend UI standard.

Current styling reality:

- MUI has been removed from the active frontend implementation
- Tailwind is the default path for UI work
- SCSS and SCSS modules still exist in parts of the codebase

Going forward, the styling direction is:

- Tailwind-first for all new UI work
- do not reintroduce MUI
- do not add new non-Tailwind component styling patterns without a specific reason

## Primary Rule

Use Tailwind for new implementation work.

That includes:

- new pages
- new feature sections
- new reusable components
- new layouts
- new forms
- new visual states

## MUI Rule

Do not add MUI back into the project.

If stale references from the old implementation are found:

- treat them as leftovers to clean up when relevant
- do not use them as a basis for new work
- do not preserve them as an active styling pattern

## Tailwind Usage

Prefer Tailwind for:

- layout
- spacing
- typography
- borders
- colors
- backgrounds
- responsive behavior
- interaction states
- form styling

Use semantic React markup with Tailwind classes as the default approach.

## SCSS Usage

SCSS is no longer the preferred path for new view styling.

Use SCSS or SCSS modules only when:

- there is already an existing SCSS-based file being adjusted
- Tailwind would be unusually awkward for a very specific styling need
- a localized styling concern is better handled in a module than inline utility classes

Do not default to creating new SCSS files for new screens or components.

## Theme And Global Styling

Current styling entry points:

- `src/styles/tailwind.css`
- `src/styles/index.scss`

## Practical Decision Rules

When adding or changing UI:

1. If the component or page is new, use Tailwind.
2. If the file already uses Tailwind, stay in Tailwind.
3. If the file has stale pre-migration remnants, do not continue that old pattern.
4. Do not add fresh MUI abstractions for convenience.

## Consistency Expectations

New UI should aim for:

- consistent spacing
- clear hierarchy
- readable density
- reusable Tailwind patterns
- minimal styling fragmentation across new code

## Precedence

If there is any conflict between older styling habits in the codebase and the current implementation direction:

- Tailwind-first for new work takes precedence
- MUI should not be reintroduced
