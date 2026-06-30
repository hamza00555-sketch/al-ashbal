-- 006 — C1: child_device_grants + the authorization helper functions.
-- These helpers are SECURITY DEFINER so they can be used inside RLS policies
-- (007) without recursively triggering RLS on the joined tables. They are the
-- ONLY sanctioned way to authorize the child/device path — a client-supplied
-- child_id is NEVER sufficient on its own.

-- ---------------------------------------------------------------- child_device_grants
-- A server-issued, revocable, expiring capability proving that a specific
-- device/browser session may act for ONE child. Created by redeeming a
-- child_access_codes code (via a server action / RPC, Phase 1b). We store ONLY
-- the token HASH; the raw token lives on the device (localStorage).
create table child_device_grants (
  id                 uuid primary key default gen_random_uuid(),
  child_id           uuid not null references children(id) on delete cascade,
  grant_token_hash   text not null,              -- HASH ONLY — never the raw token
  grant_label        text,                       -- optional, e.g. "جهاز العائلة"
  created_from_code_id uuid references child_access_codes(id),
  expires_at         timestamptz,                -- e.g. now() + 30 days (slidable)
  revoked_at         timestamptz,
  last_used_at       timestamptz,
  created_at         timestamptz not null default now()
);
create unique index child_device_grants_token_uq on child_device_grants(grant_token_hash);
create index child_device_grants_child_idx on child_device_grants(child_id);
alter table child_device_grants enable row level security;

-- Now wire the deferred FK from submissions (004) to grants.
alter table submissions
  add constraint submissions_grant_fk
  foreign key (submitted_via_grant_id) references child_device_grants(id);

-- ---------------------------------------------------------------- helpers
-- Doc-name → implemented-name:
--   is_class_teacher        → is_teacher_for_class
--   is_linked_parent        → is_parent_of_child
--   is_childs_class_teacher → is_child_in_teacher_class
-- can_access_child / has_child_grant keep their names.

create or replace function is_teacher_for_class(p_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_teachers ct
    where ct.class_id = p_class_id and ct.teacher_id = auth.uid()
  );
$$;

create or replace function is_parent_of_child(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from parent_child_links l
    where l.child_id = p_child_id and l.parent_id = auth.uid() and l.status = 'active'
  );
$$;

create or replace function is_child_in_teacher_class(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_students cs
    join class_teachers ct on ct.class_id = cs.class_id
    where cs.child_id = p_child_id and ct.teacher_id = auth.uid()
  );
$$;

-- C1: does THIS request carry a valid child_device_grant for p_child_id?
-- The device presents its RAW grant token; a Phase 1b server action HASHES it and
-- sets the transaction-local GUC `request.child_grant_token_hash` (e.g.
-- `select set_config('request.child_grant_token_hash', <hash>, true)`) BEFORE
-- querying. This function never trusts a client-supplied child_id; it requires a
-- matching, unexpired, unrevoked grant row.
-- TODO (Phase 1b): the server action MUST set the GUC (or validate the grant
-- itself with the service role). Until then `has_child_grant` returns false (the
-- GUC is unset) — so the child/device path is DENIED, not silently allowed.
create or replace function has_child_grant(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from child_device_grants g
    where g.child_id = p_child_id
      and g.revoked_at is null
      and (g.expires_at is null or g.expires_at > now())
      and g.grant_token_hash = nullif(current_setting('request.child_grant_token_hash', true), '')
  );
$$;

-- A user OR a granted device may access this child. This is the canonical
-- predicate for every child-scoped policy.
create or replace function can_access_child(p_child_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_parent_of_child(p_child_id)
      or is_child_in_teacher_class(p_child_id)
      or has_child_grant(p_child_id);
$$;

-- Helpers are callable by client roles (they enforce auth.uid()/grant internally).
grant execute on function is_teacher_for_class(uuid)      to anon, authenticated;
grant execute on function is_parent_of_child(uuid)        to anon, authenticated;
grant execute on function is_child_in_teacher_class(uuid) to anon, authenticated;
grant execute on function has_child_grant(uuid)           to anon, authenticated;
grant execute on function can_access_child(uuid)          to anon, authenticated;
