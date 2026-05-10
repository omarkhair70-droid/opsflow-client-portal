# OpsFlow Route Map

## A. Implemented Current Routes

### Public / auth flow
- `/login`
- `/signup`
- `/auth/callback`
- `/auth/route`
- `/onboarding`
- `/forbidden`

### Internal workspace (implemented)
- `/app/[orgSlug]/dashboard`
- `/app/[orgSlug]/clients`
- `/app/[orgSlug]/requests`
- `/app/[orgSlug]/requests/[requestId]`
- `/app/[orgSlug]/tasks`
- `/app/[orgSlug]/tasks/[taskId]`

### Client portal (implemented)
- `/portal/[orgSlug]/dashboard`
- `/portal/[orgSlug]/requests`
- `/portal/[orgSlug]/requests/[requestId]`

## B. Planned Future Routes

### Planned internal routes (`/app/[orgSlug]/*`)
- `/app/[orgSlug]/quotes`
- `/app/[orgSlug]/files`
- `/app/[orgSlug]/activity`
- `/app/[orgSlug]/settings/...`

### Planned portal routes (`/portal/[orgSlug]/*`)
- `/portal/[orgSlug]/quotes`
- `/portal/[orgSlug]/files`
- `/portal/[orgSlug]/approvals`
- `/portal/[orgSlug]/account`

## Route guard model (implemented)
- Internal route checks use `requireInternalOrgAccess`.
- Portal route checks use `requirePortalOrgAccess`.
- Unauthorized users redirect to `/forbidden`; unauthenticated users redirect to `/login`.

## Route hygiene note
Obsolete conceptual examples such as `/app/overview` and `/portal/home` are not current implemented routes.
\n## Phase 4 Commercial Flow (Implemented)\nQuotes + approvals are now implemented with RLS, quote versioning, and activity event audit trail. Next target: **Phase 5 — File Governance**.
