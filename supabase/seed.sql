-- Local dev seed: one 5-player ring with a sample completed week (Wk 1)
-- and an in-progress week (Wk 2) so the Arena/Reveal screens have data to render.

-- Fake auth.users rows (local dev only). Password for every seeded account is
-- "forge2026!" — fine for local/dev fixtures, never reuse this pattern for
-- real accounts.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111101', 'authenticated', 'authenticated', 'james@forge.dev', crypt('forge2026!', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111102', 'authenticated', 'authenticated', 'angus@forge.dev', crypt('forge2026!', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111103', 'authenticated', 'authenticated', 'joono@forge.dev', crypt('forge2026!', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111104', 'authenticated', 'authenticated', 'jett@forge.dev', crypt('forge2026!', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111105', 'authenticated', 'authenticated', 'noah@forge.dev', crypt('forge2026!', gen_salt('bf')), now(), now(), now(), '', '', '', '');

insert into users (id, auth_id, display_name, context_profile, lifetime_balance_cents, expo_push_token) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'JAMES', 'Musician brand manager. Runs artist deals and sponsorships, ~$18k/mo baseline revenue, small 2-person team.', 65000, null),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'ANGUS', 'Agency video director. Runs a boutique video production agency, ~$12k/mo baseline, solo operator plus freelancers.', 0, null),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'JOONO', 'E-commerce brand owner. DTC skincare brand, ~$40k/mo revenue, 4-person team.', 15000, null),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'JETT', 'Solo founder building a SaaS tool for small gyms, pre-revenue, one co-founder.', 7500, null),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'NOAH', 'Software developer, freelance + a bootstrapped side product, ~$6k/mo baseline.', 2500, null);

insert into groups (id, name, pot_cents, current_week_number) values
  ('33333333-3333-3333-3333-333333333301', 'The Ring', 65000, 2);

insert into group_members (user_id, group_id) values
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301'),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333301'),
  ('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333301'),
  ('22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333301'),
  ('22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333301');

-- Week 1: already graded.
insert into weekly_submissions (user_id, group_id, week_number, raw_text, rank, points, ai_commentary) values
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 1, 'Signed a new sponsorship deal worth $9k/mo with a mid-size energy drink brand for my top artist.', 1, 100, 'Verified recurring revenue increase. Elite outcome.'),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333301', 1, 'Delivered 3 client projects on time, started scoping a new retainer client.', 2, 75, 'Solid delivery, scoping is not yet a signed outcome.'),
  ('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333301', 1, 'Launched a new SKU, ran paid ads testing, saw mixed early results.', 3, 50, 'Shipped, but results unproven.'),
  ('22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333301', 1, 'Closed first paying customer at $49/mo after 3 discovery calls.', 4, 25, 'First revenue, small scale.'),
  ('22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333301', 1, 'Spent the week refactoring the codebase and fixing tech debt.', 5, 0, 'Pure input, no shipped outcome. Nobody pays for refactors.');

insert into milestone_snapshots (user_id, group_id, bulleted_text) values
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', '- Wk 1: Signed $9k/mo sponsorship deal (Rank 1)'),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333301', '- Wk 1: Delivered 3 client projects (Rank 2)'),
  ('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333301', '- Wk 1: Launched new SKU (Rank 3)'),
  ('22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333301', '- Wk 1: Closed first paying customer (Rank 4)'),
  ('22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333301', '- Wk 1: Refactored codebase, no shipped outcome (Rank 5)');

-- Week 2: open, no submissions yet (Sunday Portal / Stakes Room testing).
