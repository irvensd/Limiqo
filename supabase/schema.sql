-- Limiqo: per-user goals, projects, ideas, today tasks.
-- Run once in the SQL editor:
-- https://supabase.com/dashboard/project/bdlxtfxajurqgdbgwhye/sql/new

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  quarantine_days integer not null default 14,
  onboarded boolean not null default false,
  review_cleared_inbox boolean not null default false,
  review_chose_tomorrow boolean not null default false,
  review_archived_one boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  area text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  note text not null default '',
  area text not null,
  project_id text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  area text not null,
  status text not null default 'quarantined',
  captured_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  area text not null,
  project_id text,
  goal_id text,
  done boolean not null default false,
  today boolean not null default false,
  sort_order integer not null default 0
);

create index if not exists areas_user_id_idx on public.areas (user_id);
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists ideas_user_id_idx on public.ideas (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);

alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.projects enable row level security;
alter table public.goals enable row level security;
alter table public.ideas enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "areas_own" on public.areas;
create policy "areas_own" on public.areas
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "projects_own" on public.projects;
create policy "projects_own" on public.projects
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "goals_own" on public.goals;
create policy "goals_own" on public.goals
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "ideas_own" on public.ideas;
create policy "ideas_own" on public.ideas
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "tasks_own" on public.tasks;
create policy "tasks_own" on public.tasks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.areas, public.projects, public.goals, public.ideas, public.tasks to authenticated;

create or replace function public.handle_limiqo_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;

  insert into public.areas (user_id, name)
  values
    (new.id, 'Career'),
    (new.id, 'Product'),
    (new.id, 'Fitness'),
    (new.id, 'Ministry'),
    (new.id, 'Life')
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_limiqo on auth.users;
create trigger on_auth_user_created_limiqo
  after insert on auth.users
  for each row execute procedure public.handle_limiqo_new_user();
