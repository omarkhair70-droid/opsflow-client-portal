# OpsFlow Route Map (Conceptual, Phase 0A)

## Purpose
Define intended route structure and context separation. No routes are implemented in this phase.

## Route Domains
1. **Public Marketing / Landing**
   - informational, unauthenticated
2. **Internal Workspace** (`/app/*`)
   - operations and administrative workflows
3. **Client Portal** (`/portal/*`)
   - client-restricted interactions

## Planned Internal Routes (`/app`)
- `/app/overview`
- `/app/requests`
- `/app/requests/:requestId`
- `/app/tasks`
- `/app/tasks/:taskId`
- `/app/clients`
- `/app/clients/:clientAccountId`
- `/app/quotes`
- `/app/quotes/:quoteId`
- `/app/files`
- `/app/activity`
- `/app/settings/org`
- `/app/settings/members`
- `/app/settings/roles`

## Planned Client Portal Routes (`/portal`)
- `/portal/home`
- `/portal/requests`
- `/portal/requests/:requestId`
- `/portal/quotes`
- `/portal/quotes/:quoteId`
- `/portal/files`
- `/portal/approvals`
- `/portal/account`

## Access Mapping Notes
- `/app/*`: internal roles only
- `/portal/*`: client users limited to linked client account data
- Any shared entities (e.g., requests, quotes, files) require context-specific filtering and field shaping
