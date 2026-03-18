# Agent Guide

## How to work in this repository
- Read `agent-knowledgebase/project-overview.md` before major changes.
- Read the relevant rule file in `agent-knowledgebase/` before implementation.
- Keep changes minimal, scoped, and aligned with Phase 1 MVP goals.
- Preserve existing public API contracts unless explicitly asked to change them.
- Prefer reusable MUI-first UI patterns and existing React Query / React Hook Form patterns.
- Do not introduce Phase 2 features into Phase 1 flows unless explicitly requested.

## Required checks before finishing
- Ensure code builds successfully.
- Ensure lint passes if the touched area uses linting.
- Keep compatibility aliases working unless explicitly asked to remove them.
- Update docs when behavior or contracts change.

## Architecture expectations
- Frontend: React + Vite + TypeScript + MUI-first approach.
- Backend: Express + SQLite persistence.
- Maintain compatibility with current Phase 1 data model and API resources.

## Prompting behavior
- Before coding, summarize the files/components/modules affected.
- For larger tasks, propose a short plan first.
- After changes, explain what changed, what was preserved, and any risks.