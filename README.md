# OpsFlow Client Portal

OpsFlow is a SaaS **Client Portal & Business Operations Platform** for B2B service companies. It manages the client-work lifecycle from request intake through internal execution, quote/approval, activity history, and closure.

## Current Status
**Phase 4 — Commercial Flow is implemented** (adds quote drafting/versioning, publishing, and portal approval decisions on top of foundation + request + task execution).

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
Comments, file governance, notifications, and closure workflows are **planned but not implemented yet**.

## Next build target
**Phase 5 — File Governance** (file metadata + visibility controls; comments/notifications/closure still planned).

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
5. Run `sql/phase4_commercial_flow.sql` in Supabase SQL editor.
6. Start app: `npm run dev`

## Auth setup notes (Supabase email templates)
OpsFlow uses **server-side session cookies** (`sb-access-token`, `sb-refresh-token`) for authenticated routing.

Magic-link and email confirmation flows must hit the server confirmation route so the backend can verify the token hash and set httpOnly cookies before redirecting to `/auth/route`.

For the **Magic Link** email template, use:
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

For the **Confirm signup** email template, use:
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

