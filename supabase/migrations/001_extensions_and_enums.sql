-- 001 — extensions, enum types, and the shared updated_at trigger.
-- الأشبال — Supabase backend, Phase 1a (foundation only; NOT wired to the app).
-- Source of truth: docs/SUPABASE_SCHEMA_DRAFT.md (+ red-team corrections C1–C5).

-- ---------------------------------------------------------------- extensions
-- gen_random_uuid() is native in PG13+; pgcrypto kept for digest()/crypt() if
-- ever needed server-side. (Token HASHING is done in the app server, not here.)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enum types
-- Stable, bounded value sets. (Mutable sets use text + CHECK instead.)
do $$ begin
  create type user_role          as enum ('teacher','parent','admin');
  create type invitation_type    as enum ('family','student');
  create type class_teacher_role as enum ('owner','assistant');
  create type child_created_by   as enum ('parent','student','teacher');
  create type link_status        as enum ('active','removed');
  create type enrollment_status  as enum ('active','left');
  create type assignment_status  as enum ('active','closed','archived');
  create type submission_source  as enum ('assignment','prep','lesson','adhoc');
  -- 'uploading' (C4) precedes 'pending_parent'; see submissions.
  create type submission_state   as enum ('uploading','pending_parent','pending_teacher','accepted','rerecord');
  create type approval_decision  as enum ('approved','rerecord');
  create type review_decision    as enum ('accepted','rerecord');
  create type recording_kind     as enum ('audio','video');
  create type attendance_status  as enum ('present','late','absent','not_joined','excused');
  create type prep_status        as enum ('today','upcoming');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------- updated_at
-- Shared trigger function: keeps updated_at current on UPDATE.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
