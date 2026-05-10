# OpsFlow Client Portal

OpsFlow is a SaaS **Client Portal & Business Operations Platform** for B2B service companies. It manages the client-work lifecycle from request intake through internal execution, quote/approval, activity history, and closure.

## Current Status
**Phase 3 — Internal Execution is implemented** (adds internal task execution on top of foundation + request lifecycle).

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
- `/portal/[orgSlug]/dashboard`
- `/portal/[orgSlug]/requests`
- `/portal/[orgSlug]/requests/[requestId]`

### Implemented tables
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `client_members`
- `requests`
- `activity_events`
- `tasks`

### Implemented access model
- Supabase auth/session flow with profile auto-provisioning trigger.
- Membership-based redirect flow at `/auth/route`.
- Internal route guards via `requireInternalOrgAccess`.
- Portal route guards via `requirePortalOrgAccess`.
- RLS enabled with helper functions:
  - `is_org_member`
  - `has_org_role`
  - `is_client_member`
  - `has_client_role`

## Intentionally not built yet
Comments, quotes, approvals, file governance, notifications, and closure workflows are **planned but not implemented yet**.

## Next build target
**Phase 4 — Commercial Flow** (quotes + approvals; comments/files still planned).

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

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup
1. Install dependencies: `npm install`
2. Run `sql/phase1_foundation.sql` in Supabase SQL editor.
3. Run `sql/phase2_request_lifecycle.sql` in Supabase SQL editor.
4. Run `sql/phase3_internal_execution.sql` in Supabase SQL editor.
5. Start app: `npm run dev`

## Auth setup notes (Supabase email templates)
OpsFlow uses **server-side session cookies** (`sb-access-token`, `sb-refresh-token`) for authenticated routing.

Magic-link and email confirmation flows must hit the server confirmation route so the backend can verify the token hash and set httpOnly cookies before redirecting to `/auth/route`.

For the **Magic Link** email template, use:
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

For the **Confirm signup** email template, use:
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
\n## Phase 4 Commercial Flow (Implemented)\nQuotes + approvals are now implemented with RLS, quote versioning, and activity event audit trail. Next target: **Phase 5 — File Governance**.
