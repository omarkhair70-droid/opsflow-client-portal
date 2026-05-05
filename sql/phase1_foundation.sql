create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','staff')),
  status text not null check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  status text not null check (status in ('active','inactive','archived')),
  primary_contact_name text,
  primary_contact_email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('client_admin','client_user')),
  status text not null check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, user_id)
);

create or replace function public.is_org_member(org_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.organization_members where organization_id = org_id and user_id = auth.uid() and status = 'active');
$$;
create or replace function public.has_org_role(org_id uuid, roles text[]) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.organization_members where organization_id = org_id and user_id = auth.uid() and status = 'active' and role = any(roles));
$$;
create or replace function public.is_client_member(c_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.client_members where client_id = c_id and user_id = auth.uid() and status = 'active');
$$;
create or replace function public.has_client_role(c_id uuid, roles text[]) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.client_members where client_id = c_id and user_id = auth.uid() and status = 'active' and role = any(roles));
$$;


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_members enable row level security;

create policy "profile self read" on public.profiles for select using (auth.uid() = id);
create policy "org read by active internal" on public.organizations for select using (public.is_org_member(id));
create policy "org members read by internal" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "org members manage by owner admin" on public.organization_members for all using (public.has_org_role(organization_id, array['owner','admin'])) with check (public.has_org_role(organization_id, array['owner','admin']));
create policy "clients read by internal" on public.clients for select using (public.is_org_member(organization_id));
create policy "clients write by owner admin manager" on public.clients for insert with check (public.has_org_role(organization_id, array['owner','admin','manager']));
create policy "clients update by owner admin manager" on public.clients for update using (public.has_org_role(organization_id, array['owner','admin','manager'])) with check (public.has_org_role(organization_id, array['owner','admin','manager']));
create policy "clients read by client member" on public.clients for select using (public.is_client_member(id));
create policy "client memberships self read" on public.client_members for select using (user_id = auth.uid());
create policy "client memberships internal read" on public.client_members for select using (public.is_org_member(organization_id));
