# OpsFlow Client Portal

OpsFlow is a SaaS **Client Portal & Business Operations Platform** for B2B service companies.

## Current Status
**Phase 2 — Request Lifecycle is implemented** (client intake, internal triage updates, status/priority tracking, and baseline activity history).

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

## Implemented tables
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `client_members`
- `requests`
- `activity_events`

## Next build target
**Phase 3 — Internal Execution**

## Setup
1. Install dependencies: `npm install`
2. Run `sql/phase1_foundation.sql` then `sql/phase2_request_lifecycle.sql` in Supabase SQL editor.
3. Start app: `npm run dev`
