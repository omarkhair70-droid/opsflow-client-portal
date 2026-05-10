-- OpsFlow Phase 4: Commercial Flow

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  request_id uuid not null references public.requests(id) on delete cascade,
  version_number integer not null,
  title text not null,
  scope_summary text not null,
  total_amount numeric(12,2) not null,
  currency text not null default 'USD',
  notes_to_client text,
  valid_until date,
  status text not null default 'draft' check (status in ('draft','published','superseded','approved','rejected','changes_requested')),
  created_by_user_id uuid not null references public.profiles(id),
  published_by_user_id uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, version_number)
);
create index if not exists quotes_org_created_at_idx on public.quotes (organization_id, created_at desc);
create index if not exists quotes_request_version_idx on public.quotes (request_id, version_number desc);
create index if not exists quotes_status_idx on public.quotes (status);
create unique index if not exists quotes_one_active_visible_per_request_idx on public.quotes (request_id)
where status in ('published','changes_requested');

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  decision text not null check (decision in ('approved','rejected','changes_requested')),
  note text,
  decided_by_user_id uuid not null references public.profiles(id),
  decided_at timestamptz not null default now(),
  unique (quote_id)
);
create index if not exists approvals_org_decided_at_idx on public.approvals (organization_id, decided_at desc);
create index if not exists approvals_quote_idx on public.approvals (quote_id);

create or replace function public.enforce_quote_integrity() returns trigger language plpgsql as $$
declare req_org_id uuid; has_approval boolean;
begin
  select organization_id into req_org_id from public.requests where id = new.request_id;
  if req_org_id is null or req_org_id <> new.organization_id then
    raise exception 'quote.request_id must match quote.organization_id';
  end if;

  if tg_op = 'UPDATE' then
    if new.organization_id <> old.organization_id or new.request_id <> old.request_id or new.created_by_user_id <> old.created_by_user_id or new.version_number <> old.version_number then
      raise exception 'quote identity fields are immutable';
    end if;
    if old.status <> 'draft' and (
      new.title is distinct from old.title or new.scope_summary is distinct from old.scope_summary or new.total_amount is distinct from old.total_amount or
      new.currency is distinct from old.currency or new.notes_to_client is distinct from old.notes_to_client or new.valid_until is distinct from old.valid_until
    ) then raise exception 'published/non-draft quote content is immutable'; end if;

    if new.status <> old.status then
      if old.status = 'draft' and new.status = 'published' then null;
      elsif old.status = 'published' and new.status = 'superseded' then null;
      elsif old.status = 'published' and new.status in ('approved','rejected','changes_requested') then
        select exists(select 1 from public.approvals a where a.quote_id = new.id and a.decision = new.status) into has_approval;
        if not has_approval then raise exception 'quote decision transition requires matching approval'; end if;
      elsif old.status = 'changes_requested' and new.status = 'superseded' then null;
      else raise exception 'invalid quote status transition % -> %', old.status, new.status;
      end if;
    end if;
  end if;
  return new;
end; $$;
create trigger quotes_enforce_integrity before insert or update on public.quotes for each row execute function public.enforce_quote_integrity();
create trigger quotes_set_updated_at before update on public.quotes for each row execute function public.set_updated_at();

create or replace function public.enforce_approval_integrity() returns trigger language plpgsql as $$
declare q record;
begin
  select q.organization_id, q.status, r.client_id into q
  from public.quotes q join public.requests r on r.id = q.request_id where q.id = new.quote_id;

  if q.organization_id is null or q.organization_id <> new.organization_id then raise exception 'approval quote/org mismatch'; end if;
  if q.status <> 'published' then raise exception 'approvals require quote to be published'; end if;
  if not exists (select 1 from public.client_members cm where cm.client_id = q.client_id and cm.user_id = new.decided_by_user_id and cm.status = 'active') then
    raise exception 'decided_by_user_id must be active client member for quote request client';
  end if;
  return new;
end; $$;
create trigger approvals_enforce_integrity before insert on public.approvals for each row execute function public.enforce_approval_integrity();
create or replace function public.block_approval_mutations() returns trigger language plpgsql as $$ begin raise exception 'approvals are immutable'; end; $$;
create trigger approvals_block_update before update on public.approvals for each row execute function public.block_approval_mutations();
create trigger approvals_block_delete before delete on public.approvals for each row execute function public.block_approval_mutations();

create or replace function public.audit_quote_events() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' then
    insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,metadata_json)
    values(new.organization_id,coalesce(auth.uid(),new.created_by_user_id),'quote',new.id,'quote_created',jsonb_build_object('request_id',new.request_id,'version_number',new.version_number,'to_status',new.status));
  elsif tg_op='UPDATE' and old.status is distinct from new.status then
    insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,metadata_json)
    values(new.organization_id,coalesce(auth.uid(),new.published_by_user_id,new.created_by_user_id),'quote',new.id,
      case new.status when 'published' then 'quote_published' when 'superseded' then 'quote_superseded' when 'approved' then 'quote_approved' when 'rejected' then 'quote_rejected' when 'changes_requested' then 'quote_changes_requested' else 'quote_status_changed' end,
      jsonb_build_object('request_id',new.request_id,'version_number',new.version_number,'from_status',old.status,'to_status',new.status));
  end if;
  return new;
end; $$;
create trigger quotes_audit_insert after insert on public.quotes for each row execute function public.audit_quote_events();
create trigger quotes_audit_update after update on public.quotes for each row execute function public.audit_quote_events();

create or replace function public.apply_approval_to_quote() returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.quotes set status=new.decision where id=new.quote_id;
  return new;
end; $$;
create trigger approvals_apply_to_quote after insert on public.approvals for each row execute function public.apply_approval_to_quote();

alter table public.quotes enable row level security;
alter table public.approvals enable row level security;

create policy "quotes internal read" on public.quotes for select using (public.is_org_member(organization_id));
create policy "quotes internal write oom" on public.quotes for insert with check (public.has_org_role(organization_id,array['owner','admin','manager']));
create policy "quotes internal update oom" on public.quotes for update using (public.has_org_role(organization_id,array['owner','admin','manager'])) with check (public.has_org_role(organization_id,array['owner','admin','manager']));
create policy "quotes portal read visible" on public.quotes for select using (
  status <> 'draft' and exists (
    select 1 from public.requests r join public.client_members cm on cm.client_id = r.client_id
    where r.id = quotes.request_id and cm.user_id = auth.uid() and cm.status = 'active'
  )
);

create policy "approvals internal read" on public.approvals for select using (public.is_org_member(organization_id));
create policy "approvals portal read" on public.approvals for select using (
  exists (
    select 1 from public.quotes q join public.requests r on r.id=q.request_id join public.client_members cm on cm.client_id=r.client_id
    where q.id = approvals.quote_id and cm.user_id=auth.uid() and cm.status='active'
  )
);
create policy "approvals portal insert" on public.approvals for insert with check (
  decided_by_user_id = auth.uid() and exists (
    select 1 from public.quotes q join public.requests r on r.id=q.request_id join public.client_members cm on cm.client_id=r.client_id
    where q.id = approvals.quote_id and q.status='published' and cm.user_id=auth.uid() and cm.status='active'
  )
);
