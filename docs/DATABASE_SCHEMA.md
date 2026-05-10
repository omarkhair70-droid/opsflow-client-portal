# OpsFlow Database Schema

## Implemented Phase 1
`profiles`, `organizations`, `organization_members`, `clients`, `client_members`.

## Implemented Phase 2
`requests`, `activity_events`.

## Implemented Phase 3
`tasks`.

## Implemented Phase 4
Source of truth: `sql/phase4_commercial_flow.sql`.

### `quotes`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete cascade`
- `request_id uuid not null references public.requests(id) on delete cascade`
- `version_number integer not null`
- `title text not null`
- `scope_summary text not null`
- `total_amount numeric(12,2) not null`
- `currency text not null default 'USD'`
- `notes_to_client text`
- `valid_until date`
- `status text not null default 'draft'` (`draft|published|superseded|approved|rejected|changes_requested`)
- `created_by_user_id uuid not null references public.profiles(id)`
- `published_by_user_id uuid references public.profiles(id)`
- `published_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `approvals`
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete cascade`
- `quote_id uuid not null references public.quotes(id) on delete cascade`
- `decision text not null` (`approved|rejected|changes_requested`)
- `note text`
- `decided_by_user_id uuid not null references public.profiles(id)`
- `decided_at timestamptz not null default now()`
