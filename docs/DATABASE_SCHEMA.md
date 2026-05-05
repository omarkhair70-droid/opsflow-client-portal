# OpsFlow Database Schema (Conceptual, Phase 0A)

## Scope
This schema is conceptual and intended for planning. No migrations are defined in this phase.

## Core Tables (Planned)

### identity
- `users`
  - id
  - email
  - full_name
  - created_at
- `organizations`
  - id
  - name
  - slug
  - created_at
- `organization_memberships`
  - id
  - organization_id
  - user_id
  - role
  - status
  - created_at

### client model
- `client_accounts`
  - id
  - organization_id
  - name
  - status
  - created_at
- `client_contacts`
  - id
  - organization_id
  - client_account_id
  - user_id (nullable if invited external not yet joined)
  - contact_role
  - created_at

### workflow
- `requests`
  - id
  - organization_id
  - client_account_id
  - title
  - description
  - status
  - priority
  - submitted_by_user_id
  - created_at
  - updated_at
- `tasks`
  - id
  - organization_id
  - request_id
  - assigned_to_user_id
  - title
  - status
  - due_at
  - created_at
  - updated_at

### commercial
- `quotes`
  - id
  - organization_id
  - request_id
  - version
  - status
  - subtotal_amount
  - currency
  - created_by_user_id
  - created_at
- `approvals`
  - id
  - organization_id
  - quote_id
  - decision
  - comment
  - decided_by_user_id
  - decided_at

### file governance
- `file_assets`
  - id
  - organization_id
  - request_id (nullable)
  - quote_id (nullable)
  - storage_path
  - visibility_scope (`internal`, `client`)
  - uploaded_by_user_id
  - created_at

### communications
- `notifications`
  - id
  - organization_id
  - user_id
  - type
  - payload_json
  - read_at
  - created_at

### auditing
- `activity_events`
  - id
  - organization_id
  - actor_user_id
  - entity_type
  - entity_id
  - action
  - metadata_json
  - occurred_at

## Relationship Summary
- organization -> memberships, client_accounts, requests, tasks, quotes, files, notifications, activity_events
- client_account -> requests, client_contacts
- request -> tasks, quotes, files
- quote -> approvals, files

## Schema Rules
1. All business tables include `organization_id`.
2. Client-facing entities include `client_account_id` where relevant.
3. Activity events are append-only.
4. File visibility is explicit and policy-enforced.
