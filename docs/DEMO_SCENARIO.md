# OpsFlow Demo Scenario

## Goal
Demonstrate OpsFlow as a SaaS-first operations platform with strong tenant isolation, secure internal/client separation, and auditable lifecycle execution.

## Scenario Actors
- Org Owner (internal)
- Ops Manager (internal)
- Team Member (internal)
- Client User (external)

## End-to-End Story
1. Org Owner creates an organization and invites internal team members through `organization_members`.
2. Ops Manager creates a client record in `clients` and links client users through `client_members`.
3. Client User submits a new request in the portal.
4. Internal team triages the request and creates tasks for execution.
5. Ops Manager prepares a quote draft and publishes the client-visible version.
6. Client User reviews the published quote and submits an approval/rejection/changes-request decision.
7. System records major request/task/quote actions in an append-only activity trail.
8. File governance, comments, notifications, and closure remain planned next-phase capabilities.

## Proof Points in Demo
- Tenant boundaries are organization-scoped.
- Internal workspace and client portal experiences remain separate.
- Role differences are enforced across internal and client participants.
- Internal-only visibility is protected from portal users.
- Audit trail integrity is maintained across critical lifecycle events.

## Demo Success Criteria
Stakeholders can clearly see:
- how OpsFlow unifies client-to-execution workflow without collapsing security boundaries
- how internal and portal contexts remain properly separated
- how lifecycle actions are traceable through activity history
- how the platform positioning differs from HILTECH via SaaS architecture and governance rigor

