# OpsFlow Current State Snapshot

## What OpsFlow is
OpsFlow is a SaaS Client Portal & Business Operations Platform for B2B service companies, designed to run the lifecycle from request intake to internal execution, quote/approval, activity history, and closure.

## What exists today (implemented)
- Phase 1 foundation is implemented.
- Phase 2 Request Lifecycle is implemented.
- Supabase auth/session flow is implemented.
- Profile auto-provisioning is implemented.
- Org-scoped internal and portal shells are implemented.
- Membership-based redirecting and org-scoped access guards are implemented.
- Baseline RLS is implemented on foundation tables.
- Request lifecycle RLS is implemented on `requests` and `activity_events`.

## What does not exist yet (planned)
- Tasks/comments collaboration model.
- Quotes/approvals lifecycle.
- File governance flows.
- Notifications and full activity event domain expansion beyond request events.
- End-to-end closure workflow.

## Implemented tables
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `client_members`
- `requests`
- `activity_events`

## Implemented routes
- `/login`
- `/signup`
- `/auth/callback`
- `/auth/route`
- `/onboarding`
- `/forbidden`
- `/app/[orgSlug]/dashboard`
- `/app/[orgSlug]/clients`
- `/app/[orgSlug]/requests`
- `/app/[orgSlug]/requests/[requestId]`
- `/portal/[orgSlug]/dashboard`
- `/portal/[orgSlug]/requests`
- `/portal/[orgSlug]/requests/[requestId]`

## Implemented auth/access model
- Auth provider: Supabase Auth.
- Redirect model: `/auth/route` resolves active membership and routes accordingly.
- Internal guard helper: `requireInternalOrgAccess`.
- Portal guard helper: `requirePortalOrgAccess`.
- RLS helper functions:
  - `is_org_member`
  - `has_org_role`
  - `is_client_member`
  - `has_client_role`

## Next build target
**Phase 3 — Internal Execution**

## Non-goals for next phase
- No auth model rewrite.
- No table renames to conceptual legacy names.
- No UI-wide redesign.
- No unrelated scope expansion (CRM/ERP/accounting/AI).

## Conflict resolution note
If another document conflicts with this file and the current code/SQL implementation, current implementation wins until docs are updated.
