-- Forge v1.0 schema
-- Fixed 5-player ring, winner-take-all weekly competition.

create extension if not exists "pgcrypto";

-- ── users ────────────────────────────────────────────────────────────────
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null,
  -- Immutable free-text profile set once at onboarding (business, scale, baseline).
  context_profile text not null,
  lifetime_balance_cents integer not null default 0,
  expo_push_token text,
  created_at timestamptz not null default now()
);

-- ── groups ───────────────────────────────────────────────────────────────
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pot_cents integer not null default 0,
  current_week_number integer not null default 1,
  created_at timestamptz not null default now()
);

create table group_members (
  user_id uuid not null references users (id) on delete cascade,
  group_id uuid not null references groups (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

-- ── weekly_submissions ───────────────────────────────────────────────────
create table weekly_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  group_id uuid not null references groups (id) on delete cascade,
  week_number integer not null,
  raw_text text not null check (char_length(raw_text) <= 280),
  rank smallint check (rank between 1 and 5),
  points integer,
  ai_commentary text,
  created_at timestamptz not null default now(),
  unique (user_id, group_id, week_number)
);

-- ── milestone_snapshots ──────────────────────────────────────────────────
-- One row per (user, group): a single continually-appended bullet-list string.
create table milestone_snapshots (
  user_id uuid not null references users (id) on delete cascade,
  group_id uuid not null references groups (id) on delete cascade,
  bulleted_text text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

-- ── stakes ───────────────────────────────────────────────────────────────
-- Ante ledger for the Stakes Room (Nuke Trigger / Match Bet).
create table stakes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  week_number integer not null,
  user_id uuid not null references users (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

create index on weekly_submissions (group_id, week_number);
create index on stakes (group_id, week_number);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table users enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table weekly_submissions enable row level security;
alter table milestone_snapshots enable row level security;
alter table stakes enable row level security;

-- Helper: the app-user row belonging to the calling auth session.
create or replace function current_app_user_id()
returns uuid
language sql
security definer
stable
as $$
  select id from users where auth_id = auth.uid();
$$;

-- Helper: is the calling user a member of the given group?
create or replace function is_group_member(target_group_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from group_members
    where group_id = target_group_id
      and user_id = current_app_user_id()
  );
$$;

create policy "users read own row" on users
  for select using (auth_id = auth.uid());

create policy "users update own row" on users
  for update using (auth_id = auth.uid());

create policy "group members can read their groups" on groups
  for select using (is_group_member(id));

create policy "group members can read membership" on group_members
  for select using (is_group_member(group_id));

create policy "group members can read submissions" on weekly_submissions
  for select using (is_group_member(group_id));

create policy "users can insert own submissions" on weekly_submissions
  for insert with check (
    user_id = current_app_user_id() and is_group_member(group_id)
  );

create policy "group members can read milestone snapshots" on milestone_snapshots
  for select using (is_group_member(group_id));

create policy "group members can read stakes" on stakes
  for select using (is_group_member(group_id));

create policy "users can insert own stakes" on stakes
  for insert with check (
    user_id = current_app_user_id() and is_group_member(group_id)
  );

-- Writes to rank/points/pot transfers and milestone snapshot distillation are
-- performed by edge functions using the service role key, which bypasses RLS.
