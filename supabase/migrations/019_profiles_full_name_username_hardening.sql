-- 019_profiles_full_name_username_hardening.sql
--
-- Aligns repo with live profiles schema (full_name + username) and replaces
-- the legacy handle_new_user trigger that wrote the dropped `name` column —
-- the root cause of OAuth users authenticating without a profiles row.
--
-- Idempotent: safe to re-run. Preserves existing data. Never overwrites role.

begin;

-- ============================================================================
-- A. Ensure columns exist
-- ============================================================================
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists username  text;

-- ============================================================================
-- B. Backfill full_name from legacy `name` (if column still exists) or email
-- ============================================================================
do $outer$
declare
  has_name boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'name'
  ) into has_name;

  if has_name then
    execute $sql$
      update public.profiles
      set full_name = coalesce(full_name, name, split_part(email, '@', 1), 'Porterful User')
      where full_name is null
    $sql$;
  else
    update public.profiles
    set full_name = coalesce(full_name, split_part(email, '@', 1), 'Porterful User')
    where full_name is null;
  end if;
end
$outer$;

-- ============================================================================
-- C. Backfill username — lowercased, sanitized, collision-suffixed with id
-- ============================================================================
do $$
declare
  rec record;
  base_username text;
  candidate text;
  attempts int;
begin
  for rec in
    select id, email, full_name
    from public.profiles
    where username is null or btrim(username) = ''
  loop
    base_username := lower(coalesce(
      nullif(regexp_replace(coalesce(rec.full_name, ''), '[^a-zA-Z0-9_]+', '', 'g'), ''),
      nullif(regexp_replace(split_part(coalesce(rec.email, ''), '@', 1), '[^a-zA-Z0-9_]+', '', 'g'), ''),
      'user_' || substr(rec.id::text, 1, 8)
    ));

    candidate := base_username;
    attempts := 0;

    while exists (
      select 1 from public.profiles p
      where p.username = candidate and p.id <> rec.id
    ) and attempts < 5 loop
      candidate := base_username || '_' || substr(rec.id::text, 1, 4 + attempts);
      attempts := attempts + 1;
    end loop;

    update public.profiles set username = candidate where id = rec.id;
  end loop;
end
$$;

-- ============================================================================
-- D. Unique partial index on username (allows nulls; idempotent)
--    Skips creation if any unique index already covers (username) on profiles.
-- ============================================================================
do $$
begin
  if not exists (
    select 1
    from pg_indexes pi
    join pg_index   px on px.indexrelid = (pi.schemaname || '.' || pi.indexname)::regclass
    where pi.schemaname = 'public'
      and pi.tablename  = 'profiles'
      and px.indisunique
      and pg_get_indexdef(px.indexrelid) ilike '%(username)%'
  ) then
    create unique index profiles_username_key
      on public.profiles (username)
      where username is not null;
  end if;
end
$$;

-- ============================================================================
-- E. Replace handle_new_user() — writes full_name/username, never `name`
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta          jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email       text  := lower(coalesce(new.email, ''));
  v_email_local text  := split_part(v_email, '@', 1);
  v_full_name   text;
  v_avatar_url  text;
  base_username text;
  v_username    text;
  attempts      int := 0;
begin
  v_full_name := coalesce(
    nullif(meta->>'full_name', ''),
    nullif(meta->>'name', ''),
    nullif(v_email_local, ''),
    'Porterful User'
  );

  v_avatar_url := coalesce(
    nullif(meta->>'avatar_url', ''),
    nullif(meta->>'picture', '')
  );

  base_username := lower(coalesce(
    nullif(regexp_replace(v_full_name,   '[^a-zA-Z0-9_]+', '', 'g'), ''),
    nullif(regexp_replace(v_email_local, '[^a-zA-Z0-9_]+', '', 'g'), ''),
    'user_' || substr(new.id::text, 1, 8)
  ));

  v_username := base_username;
  while exists (select 1 from public.profiles where username = v_username) and attempts < 5 loop
    v_username := base_username || '_' || substr(new.id::text, 1, 4 + attempts);
    attempts   := attempts + 1;
  end loop;

  insert into public.profiles (id, email, full_name, username, avatar_url, role)
  values (new.id, v_email, v_full_name, v_username, v_avatar_url, 'supporter')
  on conflict (id) do update set
    email      = coalesce(public.profiles.email,      excluded.email),
    full_name  = coalesce(public.profiles.full_name,  excluded.full_name),
    username   = coalesce(public.profiles.username,   excluded.username),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
    -- intentionally no role update: never downgrade an existing role,
    -- never auto-promote to artist.

  return new;
exception
  when others then
    -- Never block auth.users insert. Log and continue so the session is still issued;
    -- the app-side ensureProfile() utility will reconcile on first authenticated request.
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Re-bind the trigger (CREATE OR REPLACE FUNCTION updates body, but ensure the
-- trigger is wired to the latest function definition).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
