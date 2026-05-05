# OpsFlow Client Portal — Phase 1 Foundation

Phase 1 implements only authentication, tenant membership modeling, RLS isolation, and shell routes.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup
1. Install dependencies: `npm install`
2. Run DB migration SQL in `sql/phase1_foundation.sql` in Supabase SQL editor.
3. Start app: `npm run dev`

## Routes (Phase 1)
- `/login`
- `/signup`
- `/auth/callback`
- `/onboarding`
- `/app/[orgSlug]/dashboard`
- `/app/[orgSlug]/clients`
- `/portal/[orgSlug]/dashboard`

## Auth redirect behavior
After callback/session establishment, `/auth/route` checks membership from DB:
- active `organization_members` => `/app/[orgSlug]/dashboard`
- else active `client_members` => `/portal/[orgSlug]/dashboard`
- else => `/onboarding`
- if both, internal workspace is preferred

## Testing internal vs client separation
- Use two users in Supabase.
- User A: active row in `organization_members`.
- User B: active row only in `client_members`.
- Sign in as each user and verify destination route.

## Intentionally deferred (not in Phase 1)
Requests, tasks, files, quotes, notifications, analytics, AI, payments, subscriptions, CRM, project management, workflow builder, custom form builder, and real dashboards.
