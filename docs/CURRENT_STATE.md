# OpsFlow Current State Snapshot

## Implemented
- Phase 1 foundation and Phase 2 Request Lifecycle are implemented.
- Portal users can submit and view only their own client requests.
- Internal users can list/view org requests and update status/priority.
- Request audit activity is recorded in `activity_events` via DB triggers.

## Implemented tables
- `profiles`, `organizations`, `organization_members`, `clients`, `client_members`
- `requests`, `activity_events`

## Implemented routes
- `/login`, `/signup`, `/auth/callback`, `/auth/route`, `/onboarding`, `/forbidden`
- `/app/[orgSlug]/dashboard`, `/app/[orgSlug]/clients`
- `/app/[orgSlug]/requests`, `/app/[orgSlug]/requests/[requestId]`
- `/portal/[orgSlug]/dashboard`
- `/portal/[orgSlug]/requests`, `/portal/[orgSlug]/requests/[requestId]`

## Next build target
**Phase 3 — Internal Execution**
