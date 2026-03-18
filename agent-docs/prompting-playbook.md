# Prompting Playbook

## Prompt Pattern
Use this structure for Codex tasks:

1. Goal
2. Relevant files/docs
3. Constraints
4. Output expectation
5. Validation expectation

## Example Prompt
Implement customer pricing edit functionality.

Read first:
- AGENTS.md
- agent-docs/project-overview.md
- agent-docs/modules-phase1.md
- agent-docs/data-model-and-api.md

Constraints:
- Keep Phase 1 scope only
- Preserve existing endpoint compatibility aliases
- Reuse existing MUI form/dialog patterns
- Do not introduce inventory logic

Expected output:
- Update frontend form and list behavior
- Update backend route/service if needed
- Keep validation consistent
- Explain changed files and risks

Validation:
- Build passes
- Existing customer pricing flow still works