# OpsFlow Database Schema

## Section A — Implemented Phase 1 Foundation Schema

Source of truth: `sql/phase1_foundation.sql`.

### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text`
- `email text`
- `avatar_url text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `organizations`
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text unique not null`
- `logo_url text`
- `industry text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `organization_members`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references organizations(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `role text not null check (role in ('owner','admin','manager','staff'))`
- `status text not null check (status in ('active','invited','suspended'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (organization_id, user_id)`

### `clients`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references organizations(id) on delete cascade`
- `name text not null`
- `status text not null check (status in ('active','inactive','archived'))`
- `primary_contact_name text`
- `primary_contact_email text`
- `phone text`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `client_members`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references organizations(id) on delete cascade`
- `client_id uuid not null references clients(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `role text not null check (role in ('client_admin','client_user'))`
- `status text not null check (status in ('active','invited','suspended'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (client_id, user_id)`

## Section B — Planned MVP Schema (Not Yet Implemented)

### Planned tables
- `requests`
- `tasks`
- `quotes`
- `approvals`
- `file_assets`
- `notifications`
- `activity_events`
- `comments` (planned only if needed to support request/task collaboration in the product spine)

### Planned schema rules
1. Every tenant-scoped business table must include `organization_id`.
2. Portal-visible entities must include explicit visibility rules and policy-enforced filters.
3. Internal-only notes/files/fields must remain non-portal-visible by default.
4. `activity_events` must be append-only.
5. Future workflow relations should follow the product spine:
   - request → tasks/files/comments
   - request → quotes → approvals
   - critical transitions → activity events

## Terminology rule
`organization_members`, `clients`, and `client_members` are the implemented Phase 1 names. Deprecated conceptual names such as `organization_memberships`, `client_accounts`, and `client_contacts` are not implemented schema objects.
