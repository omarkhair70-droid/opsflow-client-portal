# OpsFlow Client Portal — Phase 1 Foundation

Phase 1 includes only Supabase auth/session flow, user profiles, organizations, internal/client memberships, RLS isolation, membership-based routing, and placeholder workspace shells.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup
1. Install dependencies: `npm install`
2. Run `sql/phase1_foundation.sql` in Supabase SQL editor.
3. Start app: `npm run dev`

## Allowed Phase 1 routes
- `/login`
- `/signup`
- `/auth/callback`
- `/auth/route`
- `/onboarding`
- `/forbidden`
- `/app/[orgSlug]/dashboard`
- `/app/[orgSlug]/clients`
- `/portal/[orgSlug]/dashboard`

## Auth redirect behavior (`/auth/route`)
1. Active internal org membership (`organization_members.status = active`) => `/app/[orgSlug]/dashboard`
2. Else active client membership (`client_members.status = active`) => `/portal/[orgSlug]/dashboard`
3. Else => `/onboarding`

## Route access checks
- `/app/[orgSlug]/dashboard` and `/app/[orgSlug]/clients` require active internal membership for the exact organization slug.
- `/portal/[orgSlug]/dashboard` requires active client membership linked to a client under the exact organization slug.
- Unauthorized users are redirected to `/forbidden`; unauthenticated users to `/login`.

## Profile creation
`sql/phase1_foundation.sql` creates `handle_new_user` trigger on `auth.users` to insert `public.profiles` rows automatically.

## Demo data/testing guidance
- Create an organization row with slug (e.g. `acme`).
- Add internal member row for user A in `organization_members` with `status='active'`.
- Add client + client member row for user B in same org with `status='active'`.
- Verify:
  - user B denied from `/app/acme/dashboard` and `/app/acme/clients`.
  - user A denied from `/app/other-org/dashboard` if no membership there.
  - users without matching client membership denied from `/portal/acme/dashboard`.

## Intentionally deferred (not in Phase 1)
Requests, tasks, comments, files/storage, quotes, notifications, analytics, AI, payments/subscriptions, CRM, project management, workflow builder, custom forms, and real dashboards.
