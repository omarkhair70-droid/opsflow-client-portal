# OpsFlow Product Specification

## Product Definition
OpsFlow is a SaaS **Client Portal & Business Operations Platform** for B2B service companies. It centralizes client-facing requests and internal execution in one tenant-aware system.

OpsFlow is no longer only a Phase 0A concept: the Phase 1 foundation is implemented and this spec now distinguishes current reality from upcoming MVP delivery.

## Problem Statement
B2B service teams often run client work through fragmented tools (email, spreadsheets, chat, shared drives), causing weak handoffs, poor visibility, duplicate effort, and limited auditability.

OpsFlow addresses this through strict tenant isolation, role-aware access, and clear separation between internal workspace operations and client portal participation.

## Product Goals
1. Provide a secure multi-tenant operating model for organizations and clients.
2. Separate internal operations from client-visible experiences.
3. Standardize lifecycle management across request → execution → commercial flow → closure.
4. Enforce role-based access with row-level security and auditable history.
5. Remain implementation-practical for phased MVP delivery.

## Core Personas
1. **Org Owner / Admin** — manages organization setup, membership, policy, and oversight.
2. **Operations Manager** — triages requests, coordinates execution, and maintains delivery flow.
3. **Team Member** — executes assigned work and updates operational records.
4. **Client User** — submits requests and participates in approvals and portal-visible collaboration.

## Implemented Foundation (Phase 1)
- Supabase auth/session flow and profile auto-provisioning.
- Tenant model using `organizations` and `organization_members`.
- Client model using `clients` and `client_members`.
- Internal workspace shell and client portal shell.
- Membership-based auth redirect and org-scoped access guards.
- Baseline RLS and helper functions for membership and role checks.

## Planned MVP Capabilities (Next Phases)
- Request lifecycle (`requests`) and triage workflow.
- Internal execution (`tasks`, planned comments support if required by workflow).
- Commercial flow (`quotes`, `approvals`).
- File governance (`file_assets`) with visibility enforcement.
- Notifications (`notifications`) and append-only activity trail (`activity_events`).
- End-to-end closure across the full product spine.

## Scope Boundaries
- No CRM/ERP replacement scope.
- No accounting, payment, or subscription billing system in MVP core.
- No AI-first scope expansion.
- No deviation from tenant + role + audit-first architecture.

## Positioning Relative to HILTECH
OpsFlow is positioned as a flagship SaaS product with strong multi-tenant architecture, strict internal/client separation, and security-first workflow governance. It is not attempting HILTECH feature parity as the primary proof; its proof is operational rigor, access control integrity, and lifecycle traceability.
\n## Phase 4 Commercial Flow (Implemented)\nQuotes + approvals are now implemented with RLS, quote versioning, and activity event audit trail. Next target: **Phase 5 — File Governance**.
