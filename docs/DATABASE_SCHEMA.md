# OpsFlow Database Schema

## Implemented schema

### Foundation (Phase 1)
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `client_members`

### Request Lifecycle (Phase 2)

#### `requests`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references organizations(id) on delete cascade`
- `client_id uuid not null references clients(id) on delete cascade`
- `title text not null`
- `description text`
- `status text not null default 'submitted'` with allowed: `submitted|triaged|in_progress|waiting_on_client|closed`
- `priority text not null default 'normal'` with allowed: `low|normal|high|urgent`
- `submitted_by_user_id uuid not null references profiles(id)`
- `triaged_by_user_id uuid references profiles(id)`
- `triaged_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:
- `(organization_id, created_at desc)`
- `(client_id, created_at desc)`
- `(status)`
- `(priority)`

#### `activity_events`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references organizations(id) on delete cascade`
- `actor_user_id uuid references profiles(id)`
- `entity_type text not null`
- `entity_id uuid not null`
- `action text not null`
- `metadata_json jsonb not null default '{}'::jsonb`
- `occurred_at timestamptz not null default now()`

Indexes:
- `(organization_id, occurred_at desc)`
- `(entity_type, entity_id)`

## Planned (not implemented)
- `tasks`, `quotes`, `approvals`, `file_assets`, `notifications`, optional `comments`
