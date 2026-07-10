-- Forge v1.1: Vulture Vault, Deadlock tiebreaker, BS Button audits.

alter table groups
  add column vault_cents integer not null default 0,
  add column week_status text not null default 'open' check (week_status in ('open', 'deadlocked', 'settled')),
  add column deadlock_finalist_ids uuid[],
  add column deadlock_deadline timestamptz;

-- ── vulture_vault_events ─────────────────────────────────────────────────
-- Append-only ledger of vault seizures, so the tax is auditable rather than
-- just a running counter with no history.
create table vulture_vault_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  week_number integer not null,
  seized_cents integer not null check (seized_cents > 0),
  created_at timestamptz not null default now()
);

-- ── audits (the BS Button) ───────────────────────────────────────────────
create table audits (
  id uuid primary key default gen_random_uuid(),
  weekly_submission_id uuid not null references weekly_submissions (id) on delete cascade,
  accuser_user_id uuid not null references users (id) on delete cascade,
  evidence_url text not null,
  status text not null default 'open' check (status in ('open', 'upheld', 'dismissed')),
  resolves_at timestamptz not null default (now() + interval '1 hour'),
  created_at timestamptz not null default now()
);

create table audit_votes (
  audit_id uuid not null references audits (id) on delete cascade,
  voter_user_id uuid not null references users (id) on delete cascade,
  vote boolean not null,
  created_at timestamptz not null default now(),
  primary key (audit_id, voter_user_id)
);

create index on vulture_vault_events (group_id, week_number);
create index on audits (weekly_submission_id);
create index on audits (status, resolves_at);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table vulture_vault_events enable row level security;
alter table audits enable row level security;
alter table audit_votes enable row level security;

create policy "group members can read vault events" on vulture_vault_events
  for select using (is_group_member(group_id));

create policy "group members can read audits" on audits
  for select using (
    exists (
      select 1 from weekly_submissions ws
      where ws.id = weekly_submission_id and is_group_member(ws.group_id)
    )
  );

create policy "users can open an audit on someone else's submission" on audits
  for insert with check (
    accuser_user_id = current_app_user_id()
    and exists (
      select 1 from weekly_submissions ws
      where ws.id = weekly_submission_id
        and is_group_member(ws.group_id)
        and ws.user_id != current_app_user_id()
    )
  );

create policy "group members can read audit votes" on audit_votes
  for select using (
    exists (
      select 1 from audits a
      join weekly_submissions ws on ws.id = a.weekly_submission_id
      where a.id = audit_id and is_group_member(ws.group_id)
    )
  );

create policy "users can cast their own audit vote" on audit_votes
  for insert with check (voter_user_id = current_app_user_id());

-- Rank swaps, vault seizures, and week-status transitions are performed by
-- edge functions using the service role key, which bypasses RLS.
