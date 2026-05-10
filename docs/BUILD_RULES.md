# OpsFlow Build Rules

## Purpose
Define non-negotiable delivery guardrails for OpsFlow after Phase 1 foundation.

## Core Principles
1. Multi-tenant boundaries are non-negotiable.
2. Internal workspace and client portal remain strictly separated.
3. Authorization is enforced at both application and RLS layers.
4. Auditability is a first-class requirement.
5. Security and data visibility default to least privilege.
6. Current implementation is the source of truth over stale conceptual naming.

## Required Engineering Rules
- Every future business table must include `organization_id`.
- Every future protected table must have RLS before production use.
- Route handlers and queries must include explicit tenancy context.
- Portal reads/writes must enforce client-scoped constraints.
- Internal-only fields/files must never be serialized to portal payloads.
- Do not mix internal and portal payload models in unrestricted responses.
- Every critical state transition must emit an `activity_events` record.

## Delivery Rules
- Build in vertical slices aligned to the product spine.
- Each feature requires acceptance criteria including role and security behavior.
- Add policy tests alongside feature implementation.
- Update docs whenever schema, route, or access decisions change.

## Documentation and Truth Rules
- Use implemented terminology (`organization_members`, `clients`, `client_members`) for current-state docs.
- Clearly label implemented vs planned capabilities in all architecture/product docs.
- If documentation drifts from code, reconcile docs immediately before expanding scope.

## Anti-Patterns to Avoid
- Shared queries without tenancy predicates.
- Authorization implied only in UI behavior.
- Mixing portal and internal visibility in one unrestricted payload.
- Mutable audit logs.
- Claiming planned modules as implemented.
