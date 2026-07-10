-- Support columns for resolve-deadlock: where a finalist's extra tiebreaker
-- context lands, and whether the paused settlement already owes a Vulture
-- Vault seizure decided at the original grading pass.
alter table weekly_submissions add column tiebreaker_text text;
alter table groups add column deadlock_inflation_penalty boolean not null default false;
