# OpsFlow Architecture (Phase 0A)

## Architecture Goals
- SaaS-ready multi-tenant foundation
- Security by default with strict tenant isolation
- Clear separation between internal workspace and client portal
- Evented audit history across all critical actions

## High-Level Logical Architecture
1. **Presentation Layer**
   - Internal Workspace App (operations users)
   - Client Portal App (external client users)
2. **Application Layer**
   - Auth/session handling
   - Domain services (requests, tasks, files, quotes, approvals)
   - Notification orchestration
3. **Data Layer**
   - Relational data model with tenant scoping
   - File storage with visibility metadata
   - Activity/audit event ledger
4. **Security Layer (Cross-Cutting)**
   - Role-based access model
   - Row-level security policies
   - Context-aware data filtering

## Tenant Boundary Model
- Every business record belongs to an `organization_id`.
- Access checks must enforce organization membership.
- Client users are further constrained by `client_account_id` relationships.

## Workspace vs Portal Separation
- **Internal Workspace**:
  - broader operational visibility
  - privileged workflow functions
  - internal-only notes/files/events
- **Client Portal**:
  - restricted records tied to client account
  - no internal-only artifacts
  - approval and response-focused interactions

## Domain Service Boundaries
- **Identity & Membership**: users, org memberships, roles
- **Client Accounts**: external entities and contacts
- **Request Intake**: request creation, triage, status transitions
- **Task Execution**: assignment, due dates, completion states
- **Quote & Approval**: quote versions, decision workflows
- **File Governance**: upload metadata, visibility labels, ownership
- **Activity Ledger**: append-only event stream for auditability

## Security & Compliance Considerations
- Principle of least privilege
- Deny-by-default policy posture
- Immutable audit entries for critical operations
- Visibility labels enforced at data policy layer

## Scalability Considerations
- Tenant-scoped indexing strategy
- Event tables partition-ready for growth
- Service boundaries designed for future modularization
- Separation of read patterns between internal and portal contexts

## Observability (Documentation Target)
Future implementation should include:
- request lifecycle metrics
- task SLA tracking
- approval turnaround times
- security/audit policy hit logs
