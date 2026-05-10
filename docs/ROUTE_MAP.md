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

### Client portal (implemented)
- `/portal/[orgSlug]/dashboard`

## B. Planned Future Routes

### Planned internal routes (`/app/[orgSlug]/*`)
- `/app/[orgSlug]/requests`
- `/app/[orgSlug]/requests/[requestId]`
- `/app/[orgSlug]/tasks`
- `/app/[orgSlug]/quotes`
- `/app/[orgSlug]/files`
- `/app/[orgSlug]/activity`
- `/app/[orgSlug]/settings/...`

### Planned portal routes (`/portal/[orgSlug]/*`)
- `/portal/[orgSlug]/requests`
- `/portal/[orgSlug]/requests/[requestId]`
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
