-- OpsFlow Phase 2: Request Lifecycle

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'submitted' check (status in ('submitted','triaged','in_progress','waiting_on_client','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  submitted_by_user_id uuid not null references public.profiles(id),
  triaged_by_user_id uuid references public.profiles(id),
  triaged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requests_organization_created_at_idx
  on public.requests (organization_id, created_at desc);
create index if not exists requests_client_created_at_idx
  on public.requests (client_id, created_at desc);
create index if not exists requests_status_idx on public.requests (status);
create index if not exists requests_priority_idx on public.requests (priority);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists activity_events_organization_occurred_at_idx
  on public.activity_events (organization_id, occurred_at desc);
create index if not exists activity_events_entity_idx
  on public.activity_events (entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

create or replace function public.audit_request_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
begin
  actor_id := auth.uid();

  if tg_op = 'INSERT' then
    insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action)
    values (new.organization_id, coalesce(actor_id, new.submitted_by_user_id), 'request', new.id, 'request_created');
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action, metadata_json)
      values (
        new.organization_id,
        coalesce(actor_id, new.triaged_by_user_id, old.triaged_by_user_id, new.submitted_by_user_id),
        'request',
        new.id,
        'request_status_changed',
        jsonb_build_object('from_status', old.status, 'to_status', new.status)
      );
    end if;

    if old.priority is distinct from new.priority then
      insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action, metadata_json)
      values (
        new.organization_id,
        coalesce(actor_id, new.triaged_by_user_id, old.triaged_by_user_id, new.submitted_by_user_id),
        'request',
        new.id,
        'request_priority_changed',
        jsonb_build_object('from_priority', old.priority, 'to_priority', new.priority)
      );
    end if;

    return new;
  end if;

  return null;
end;
$$;

create trigger requests_audit_insert
after insert on public.requests
for each row execute function public.audit_request_events();

create trigger requests_audit_update
after update on public.requests
for each row execute function public.audit_request_events();

alter table public.requests enable row level security;
alter table public.activity_events enable row level security;

create policy "internal members can read org requests"
on public.requests
for select
using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = requests.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);

create policy "client members can read own client requests"
on public.requests
for select
using (
  exists (
    select 1 from public.client_members cm
    where cm.client_id = requests.client_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  )
);

create policy "client members can insert own client requests"
on public.requests
for insert
with check (
  exists (
    select 1
    from public.client_members cm
    join public.clients c on c.id = cm.client_id
    where cm.client_id = requests.client_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and c.organization_id = requests.organization_id
  )
  and submitted_by_user_id = auth.uid()
);

create policy "internal members can update org requests"
on public.requests
for update
using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = requests.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
)
with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = requests.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);

create policy "internal members can read org activity events"
on public.activity_events
for select
using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = activity_events.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);
