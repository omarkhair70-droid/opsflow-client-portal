# OpsFlow RLS Strategy

## Objectives
- Enforce strict tenant isolation.
- Enforce role-aware access across internal and portal contexts.
- Prevent exposure of internal-only records to portal users.

## Implemented in Phase 1
### Protected foundation tables
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `client_members`

### Implemented helper functions
- `is_org_member(org_id uuid)`
- `has_org_role(org_id uuid, roles text[])`
- `is_client_member(c_id uuid)`
- `has_client_role(c_id uuid, roles text[])`

### Implemented policy posture
- Deny-by-default via RLS on foundation tables.
- `organizations` readable by active internal org members.
- `organization_members` readable by internal members; managed by owner/admin roles.
- `clients` readable by internal org members and linked active client members.
- `clients` writes limited to owner/admin/manager internal roles.
- `client_members` readable by self and internal org members.

## Implemented in Phase 2
### `requests` policies
- Internal active organization members can read all requests in their organization.
- Active client members can read requests only for their own linked `client_id`.
- Active client members can insert requests only for their own linked `client_id` and matching `organization_id`; `submitted_by_user_id` must equal `auth.uid()`.
- Internal active organization members can update requests in their organization.
- No delete policy in this phase.

### `activity_events` policies
- Internal active organization members can read activity events for their organization.
- No direct user insert/update/delete policies are granted.
- Request audit events are created from database triggers on `requests` insert/update.

## RLS Principles for Future Tables (Planned)
1. Keep deny-by-default on every protected table.
2. Require tenant checks on `organization_id` for all tenant-scoped reads/writes.
3. Separate internal and portal access paths explicitly.
4. Apply role-conditioned write policies for sensitive transitions.
5. Enforce internal-only vs portal-visible data boundaries at the policy layer.

## Implemented Table Coverage (Phase 3 additions)
- `tasks`: active internal org members can `select/insert/update` in-tenant; no delete policy; no portal access.

## Planned Table Coverage (Not Yet Implemented)
Future tables requiring explicit RLS before use:
- `quotes`
- `approvals`
- `file_assets`
- `notifications`
- optional `comments` if introduced

These tables are planned only; this document does not claim active policies exist yet for them.
