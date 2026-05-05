# OpsFlow Product Specification (Phase 0A)

## Purpose
OpsFlow is a SaaS **Client Portal & Business Operations Platform** for B2B service companies and operations teams. It centralizes client-facing requests and internal execution into one structured system.

This Phase 0A document defines product scope and positioning only. No implementation is included.

## Problem Statement
B2B service teams often manage client requests through fragmented tools (email, spreadsheets, chat, shared drives). This causes:

- inconsistent handoffs
- weak accountability
- poor visibility for clients
- duplicate data entry
- limited auditability

OpsFlow addresses these gaps through a multi-tenant, role-aware platform with clear separation between internal workspace operations and client portal access.

## Product Goals
1. Provide a secure, multi-tenant portal where organizations can manage clients and work.
2. Separate internal operations from client-visible interfaces.
3. Standardize lifecycle management for requests, tasks, files, quotes, and approvals.
4. Enforce role-based access and auditable activity history.
5. Support scalable SaaS architecture patterns from day one.

## Non-Goals (Phase 0A)
- No UI implementation
- No auth implementation
- No route/page implementation
- No database migrations
- No backend code

## Core Domain Objects
- **Organization (Tenant)**: Top-level account boundary.
- **Workspace**: Internal operating context within an organization.
- **Client Account**: External company/customer represented in the tenant.
- **User Membership**: User-to-organization and role assignment.
- **Request**: Client-originated or internal work intake item.
- **Task**: Action unit assigned to users or teams.
- **Quote**: Pricing/proposal artifact linked to request scope.
- **Approval**: Structured decision record (approve/reject/change request).
- **File Asset**: Uploaded document with visibility classification.
- **Notification**: Event-triggered message entity.
- **Activity Event**: Immutable audit trail entry.

## User Personas
1. **Org Owner / Admin**
   - configures tenant settings
   - manages roles and access policy
   - reviews operational KPIs and audit history
2. **Operations Manager**
   - triages requests
   - orchestrates workflows and assignments
   - tracks delivery status
3. **Team Member**
   - executes tasks
   - updates records
   - collaborates within workspace
4. **Client User**
   - submits requests
   - reviews files/quotes tied to their account
   - responds to approvals

## Capability Scope (MVP Target)
- Multi-tenant organization model
- Internal workspace and client portal separation
- Role-based permissions for all primary entities
- Request and task lifecycle tracking
- Quote and approval workflow
- File visibility controls (internal-only vs client-visible)
- Notifications model
- Complete activity/audit history coverage

## Success Criteria
OpsFlow MVP documentation and architecture are successful when they:

- clearly define tenancy boundaries
- define access control and RLS strategy
- document route separation between internal and portal contexts
- provide implementation-ready schema and lifecycle rules
- establish a demonstrable end-to-end operations scenario

## Positioning Relative to HILTECH
OpsFlow does **not** aim to replicate HILTECH feature parity as the core value proof. Instead, OpsFlow proves strength through:

- SaaS multi-tenant architecture
- robust role-based and row-level security model
- strict internal/client experience separation
- workflow-centric operations model
- comprehensive activity and audit integrity
