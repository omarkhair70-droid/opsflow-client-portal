# OpsFlow Client Portal

OpsFlow is a SaaS **Client Portal & Business Operations Platform** for B2B service companies. It manages the client-work lifecycle from request intake through internal execution, quote/approval, activity history, and closure.

## Current Status
**Phase 4 — Commercial Flow is implemented** (foundation + request lifecycle + internal execution + commercial quote/approval flow).

### Implemented routes
- `/login`
- `/signup`
- `/auth/callback`
- `/auth/confirm`
- `/auth/route`
- `/onboarding`
- `/forbidden`
- `/app/[orgSlug]/dashboard`
- `/app/[orgSlug]/clients`
- `/app/[orgSlug]/requests`
- `/app/[orgSlug]/requests/[requestId]`
- `/app/[orgSlug]/tasks`
- `/app/[orgSlug]/tasks/[taskId]`
- `/app/[orgSlug]/quotes`
- `/app/[orgSlug]/quotes/[quoteId]`
- `/portal/[orgSlug]/dashboard`
- `/portal/[orgSlug]/requests`
- `/portal/[orgSlug]/requests/[requestId]`
- `/portal/[orgSlug]/quotes`
- `/portal/[orgSlug]/quotes/[quoteId]`

### Implemented tables
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `client_members`
- `requests`
- `activity_events`
- `tasks`
- `quotes`
- `approvals`

## Intentionally not built yet
Comments, file governance, notifications, and closure workflows are **planned but not implemented yet**.

## Next build target
**Phase 5 — File Governance**.

## Key docs
- `docs/CURRENT_STATE.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/RLS_STRATEGY.md`
- `docs/ROUTE_MAP.md`
- `docs/MVP_ROADMAP.md`
- `docs/DEMO_SCENARIO.md`
- `docs/BUILD_RULES.md`

## Setup
1. Install dependencies: `npm install`
2. Run `sql/phase1_foundation.sql` in Supabase SQL editor.
3. Run `sql/phase2_request_lifecycle.sql` in Supabase SQL editor.
4. Run `sql/phase3_internal_execution.sql` in Supabase SQL editor.
5. Run `sql/phase4_commercial_flow.sql` in Supabase SQL editor.
6. Start app: `npm run dev`
