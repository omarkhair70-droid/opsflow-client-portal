-- OpsFlow Phase 3: Internal Execution

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  request_id uuid not null references public.requests(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  assigned_to_user_id uuid references public.profiles(id),
  created_by_user_id uuid not null references public.profiles(id),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_organization_created_at_idx on public.tasks (organization_id, created_at desc);
create index if not exists tasks_request_created_at_idx on public.tasks (request_id, created_at desc);
create index if not exists tasks_assigned_to_user_id_idx on public.tasks (assigned_to_user_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_at_idx on public.tasks (due_at);

create or replace function public.enforce_task_identity()
returns trigger
language plpgsql
as $$
declare
  request_org_id uuid;
  is_assignee_member boolean;
begin
  select organization_id into request_org_id from public.requests where id = new.request_id;

  if request_org_id is null then
    raise exception 'Invalid request_id for task';
  end if;

  if request_org_id <> new.organization_id then
    raise exception 'task.organization_id must match request.organization_id';
  end if;

  if new.assigned_to_user_id is not null then
    select exists (
      select 1 from public.organization_members om
      where om.organization_id = new.organization_id
        and om.user_id = new.assigned_to_user_id
        and om.status = 'active'
    ) into is_assignee_member;

    if not is_assignee_member then
      raise exception 'task.assigned_to_user_id must be an active organization member';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    if new.organization_id <> old.organization_id then
      raise exception 'task.organization_id is immutable';
    end if;
    if new.request_id <> old.request_id then
      raise exception 'task.request_id is immutable';
    end if;
    if new.created_by_user_id <> old.created_by_user_id then
      raise exception 'task.created_by_user_id is immutable';
    end if;

    if old.status <> 'done' and new.status = 'done' and new.completed_at is null then
      new.completed_at = now();
    elsif old.status = 'done' and new.status <> 'done' then
      new.completed_at = null;
    end if;
  elsif tg_op = 'INSERT' then
    if new.status = 'done' and new.completed_at is null then
      new.completed_at = now();
    end if;
  end if;

  return new;
end;
$$;

create trigger tasks_enforce_identity
before insert or update on public.tasks
for each row execute function public.enforce_task_identity();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.audit_task_events()
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
    insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action, metadata_json)
    values (
      new.organization_id,
      coalesce(actor_id, new.created_by_user_id),
      'task',
      new.id,
      'task_created',
      jsonb_build_object('request_id', new.request_id)
    );
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action, metadata_json)
      values (new.organization_id, coalesce(actor_id, new.created_by_user_id), 'task', new.id, 'task_status_changed',
        jsonb_build_object('request_id', new.request_id, 'from_status', old.status, 'to_status', new.status));
    end if;

    if old.assigned_to_user_id is distinct from new.assigned_to_user_id then
      insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action, metadata_json)
      values (new.organization_id, coalesce(actor_id, new.created_by_user_id), 'task', new.id, 'task_assignee_changed',
        jsonb_build_object('request_id', new.request_id, 'from_assigned_to_user_id', old.assigned_to_user_id, 'to_assigned_to_user_id', new.assigned_to_user_id));
    end if;

    if old.due_at is distinct from new.due_at then
      insert into public.activity_events (organization_id, actor_user_id, entity_type, entity_id, action, metadata_json)
      values (new.organization_id, coalesce(actor_id, new.created_by_user_id), 'task', new.id, 'task_due_date_changed',
        jsonb_build_object('request_id', new.request_id, 'from_due_at', old.due_at, 'to_due_at', new.due_at));
    end if;

    return new;
  end if;

  return null;
end;
$$;

create trigger tasks_audit_insert
after insert on public.tasks
for each row execute function public.audit_task_events();

create trigger tasks_audit_update
after update on public.tasks
for each row execute function public.audit_task_events();

alter table public.tasks enable row level security;

create policy "internal members can read org tasks"
on public.tasks
for select
using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = tasks.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);

create policy "internal members can insert org tasks"
on public.tasks
for insert
with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = tasks.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
  and created_by_user_id = auth.uid()
);

create policy "internal members can update org tasks"
on public.tasks
for update
using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = tasks.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
)
with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = tasks.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);


create or replace function public.shares_active_internal_org(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members me
    join public.organization_members them
      on them.organization_id = me.organization_id
    where me.user_id = auth.uid()
      and me.status = 'active'
      and them.user_id = target_user_id
      and them.status = 'active'
  );
$$;

create policy "profile read by shared active internal org"
on public.profiles
for select
using (public.shares_active_internal_org(id));
