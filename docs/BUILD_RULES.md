# OpsFlow Build Rules (Phase 0A)

## Purpose
Define guardrails for how OpsFlow should be built after documentation phase.

## Core Principles
1. Multi-tenant boundaries are non-negotiable.
2. Internal workspace and client portal remain strictly separated.
3. Authorization is enforced at both application and RLS layers.
4. Auditability is a first-class requirement.
5. Security and data visibility defaults to least privilege.

## Required Engineering Rules
- Every business table must include `organization_id`.
- RLS must be enabled on tenant-scoped tables.
- Route handlers and data queries must include tenancy context.
- Portal reads must enforce client-account scoping.
- Internal-only fields/files must never be serialized to portal responses.
- Every critical state transition should emit an activity event.

## Delivery Rules
- Build in vertical slices (request -> task -> quote -> approval).
- Each feature requires acceptance criteria including role/security checks.
- Add policy tests alongside feature implementation.
- Document schema and policy changes before rollout.

## Anti-Patterns to Avoid
- Shared queries without tenancy predicates
- Implicit authorization in UI only
- Mixing portal and internal visibility in one unrestricted payload
- Mutable audit logs
