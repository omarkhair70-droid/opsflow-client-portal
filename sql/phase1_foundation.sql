-- Phase 1 foundation schema + RLS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.internal_role as enum ('internal_admin','internal_member');
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.internal_role not null,
  unique (organization_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create type public.client_role as enum ('client_admin','client_member');
create table if not exists public.client_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.client_role not null,
  unique (client_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_members enable row level security;

create policy "profile self read" on public.profiles for select using (auth.uid() = id);

create policy "internal org read" on public.organizations for select using (
  exists(select 1 from public.organization_members om where om.organization_id = organizations.id and om.user_id = auth.uid())
);

create policy "internal member read" on public.organization_members for select using (
  exists(select 1 from public.organization_members om where om.organization_id = organization_members.organization_id and om.user_id = auth.uid())
);

create policy "client read" on public.clients for select using (
  exists(select 1 from public.organization_members om where om.organization_id = clients.organization_id and om.user_id = auth.uid())
  or exists(select 1 from public.client_members cm where cm.client_id = clients.id and cm.user_id = auth.uid())
);

create policy "client member read" on public.client_members for select using (
  exists(select 1 from public.client_members cm where cm.client_id = client_members.client_id and cm.user_id = auth.uid())
);
