# OpsFlow RLS Strategy (Phase 0A)

## Objectives
- Enforce strict tenant isolation
- Enforce role-based access across internal and client contexts
- Prevent exposure of internal-only records to portal users

## Policy Principles
1. **Deny by default** on all protected tables.
2. **Tenant membership required** for every data read/write.
3. **Role-conditioned writes** for sensitive actions (e.g., quote finalization).
4. **Client visibility constraints** for portal sessions.
5. **Audit insert guarantees** for tracked actions.

## Access Context Model
Session context should resolve:
- authenticated `user_id`
- active `organization_id`
- membership `role`
- optional `client_account_id` constraint for client portal users

## Table Access Patterns (Planned)
- `organizations`: readable by active members only.
- `organization_memberships`: readable by admins/managers and self rows.
- `client_accounts`: readable by internal roles; portal users only for linked account.
- `requests`: internal roles for org-wide requests; portal users for linked client account.
- `tasks`: internal roles only unless explicitly client-visible tasks are introduced later.
- `quotes` and `approvals`: internal roles plus scoped client read/respond rights.
- `file_assets`: filtered by tenant + visibility scope (`client` only in portal).
- `activity_events`: internal roles only by default.

## Internal vs Portal Enforcement
- Internal routes operate with full organization-scoped role checks.
- Portal routes apply additional client-account filters.
- Internal-only entities/fields should never be exposed to portal queries.

## Testing Strategy (Future)
- Policy unit tests per table
- Cross-tenant access denial tests
- Role matrix tests (owner/admin/manager/member/client)
- File visibility leakage tests
