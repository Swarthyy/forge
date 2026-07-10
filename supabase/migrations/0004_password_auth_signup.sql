-- Switches onboarding from magic-link to email+password. When someone signs
-- up, Supabase creates the auth.users row; this trigger mirrors it into
-- public.users automatically, reading display_name/context_profile out of
-- the signup metadata (see app/lib/auth.ts). No client-side insert policy on
-- users is needed since this runs as the trigger owner, not the caller.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (auth_id, display_name, context_profile)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'context_profile', '')
  )
  on conflict (auth_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
