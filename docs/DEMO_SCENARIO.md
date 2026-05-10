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
4. Internal team triages the request, creates tasks, and manages internal-only notes/files.
5. Ops Manager prepares a quote and publishes the client-visible version.
6. Client User reviews the quote and submits an approval decision.
7. System records major actions in an append-only activity trail.
8. Internal team completes execution and closes the request.

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
