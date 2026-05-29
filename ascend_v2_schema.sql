-- Ascend V2 Database Schema
create table if not exists public.ascend_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text default 'مصعب',
  level integer default 1,
  xp integer default 0,
  phase text default 'مرحلة التأسيس',
  momentum integer default 55,
  focus integer default 50,
  energy integer default 50,
  professional_value integer default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ascend_daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null default current_date,
  energy_input integer default 50,
  sleep_hours numeric default 5,
  readiness integer default 50,
  current_prayer text,
  prayer_status jsonb default '{}'::jsonb,
  orders jsonb default '[]'::jsonb,
  completed_orders jsonb default '{}'::jsonb,
  daily_state text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

create table if not exists public.ascend_career_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  item_type text not null,
  completed_at timestamptz default now(),
  unique(user_id, item_id)
);

alter table public.ascend_profiles enable row level security;
alter table public.ascend_daily_logs enable row level security;
alter table public.ascend_career_progress enable row level security;

drop policy if exists "ascend_profiles_own" on public.ascend_profiles;
drop policy if exists "ascend_daily_logs_own" on public.ascend_daily_logs;
drop policy if exists "ascend_career_progress_own" on public.ascend_career_progress;

create policy "ascend_profiles_own" on public.ascend_profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "ascend_daily_logs_own" on public.ascend_daily_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ascend_career_progress_own" on public.ascend_career_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
