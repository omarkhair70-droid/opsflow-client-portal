# OpsFlow Architecture

## Architecture Goals
- SaaS-ready multi-tenant foundation.
- Security by default with strict tenant isolation.
- Clear separation between internal workspace and client portal.
- Auditable lifecycle events across critical business actions.

## Implemented Foundation (Phase 1)
### Presentation and route separation
- Internal context: `/app/[orgSlug]/*`
- Portal context: `/portal/[orgSlug]/*`

### Auth and access enforcement
- Supabase auth/session handling is active.
- Membership-based redirect flow is active (`/auth/route`).
- Internal guard implemented: `requireInternalOrgAccess`.
- Portal guard implemented: `requirePortalOrgAccess`.

### Data and policy baseline
- Implemented tables: `profiles`, `organizations`, `organization_members`, `clients`, `client_members`.
- RLS is enabled on implemented foundation tables.
- Membership/role helper functions are active for policy checks.

## Planned Domain Service Boundaries (MVP)
The following boundaries are planned and should be implemented as phased vertical slices, not treated as already complete:
- **Request Intake**: `requests` creation, triage, and lifecycle transitions.
- **Task Execution (implemented)**: `tasks` assignment, ownership, due dates, completion, and activity audit events.
- **Commercial Flow**: `quotes` versioning and `approvals` decisions.
- **File Governance**: `file_assets` metadata + visibility controls.
- **Notifications**: event-triggered user notifications.
- **Activity Ledger**: append-only `activity_events` for critical transitions.

## Security Model (Cross-Cutting)
- Deny-by-default posture for protected data.
- Tenant boundary enforced by `organization_id` on business tables.
- Internal and portal payloads are context-shaped separately.
- Internal-only records must never be exposed to portal users.

## Scalability Direction
- Tenant-scoped querying and indexing patterns.
- Domain boundaries designed for modular evolution.
- Event/audit structures designed for growth and compliance needs.
