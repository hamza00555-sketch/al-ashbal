-- 011 — join requests (controlled onboarding; Phase 2 follow-up).
-- New users REQUEST access at /join/request; an approved teacher reviews and
-- approves/rejects from /teacher/join-requests. Nothing here grants access by
-- itself: approval writes profiles/teacher_profiles/... happen SERVER-SIDE via
-- the service role after requireTeacher(). Children stay child profiles (NOT
-- auth users) in this phase.

do $$ begin
  create type join_request_role   as enum ('teacher','parent');
  create type join_request_status as enum ('pending','approved','rejected','cancelled');
exception when duplicate_object then null;
end $$;

create table join_requests (
  id               uuid primary key default gen_random_uuid(),
  -- auth user created at request time (role-less: no profiles row until approval)
  auth_user_id     uuid references auth.users(id) on delete set null,
  email            text not null,
  display_name     text not null,
  requested_role   join_request_role not null,
  status           join_request_status not null default 'pending',
  note             text,
  reviewed_by      uuid references profiles(id) on delete set null,
  reviewed_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index join_requests_status_idx on join_requests(status, created_at desc);
create index join_requests_auth_user_idx on join_requests(auth_user_id);
-- one PENDING request per email (partial unique — approved/rejected history kept)
create unique index join_requests_pending_email_uq
  on join_requests(lower(email)) where status = 'pending';
create trigger join_requests_set_updated_at before update on join_requests
  for each row execute function set_updated_at();
alter table join_requests enable row level security;

-- ------------------------------------------------------------ helper
-- "Is the caller an APPROVED app teacher?" (profiles.role = 'teacher').
-- SECURITY DEFINER so policies can check it without tripping profiles RLS;
-- pinned search_path per the 009 hardening; anon gets no EXECUTE.
create or replace function is_app_teacher()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  );
$$;
revoke execute on function is_app_teacher() from anon;

-- ------------------------------------------------------------ RLS
-- Reads: a signed-in user sees their OWN request (for the pending/rejected
-- screens); approved teachers see all. anon sees nothing (no email enumeration).
-- Writes: NO client policies at all — requests are created and reviewed only by
-- the server (service role) after its own validation/authorization.
create policy join_requests_select_own on join_requests
  for select to authenticated
  using (auth_user_id = auth.uid());

create policy join_requests_select_teacher on join_requests
  for select to authenticated
  using (is_app_teacher());

-- ------------------------------------------------------------ privileges
-- Explicit (not relying on default privileges — see 010's history):
-- authenticated may only SELECT (RLS-filtered); anon nothing; service full.
revoke all on join_requests from anon;
revoke insert, update, delete, truncate, references, trigger on join_requests from authenticated;
grant select on join_requests to authenticated;
grant all on join_requests to service_role;

-- Also scrub the leftover default-ACL trio (TRUNCATE/REFERENCES/TRIGGER[/MAINTAIN])
-- that pre-dated 010, so FUTURE tables get exactly: authenticated=DML,
-- anon=nothing, service_role=all.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger, maintain on tables from anon, authenticated;
