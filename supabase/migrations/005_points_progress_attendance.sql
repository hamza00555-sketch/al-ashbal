-- 005 — points (append-only), progress, attendance, audit.

-- Append-only points entries per child. When source_type='submission',
-- source_id = submissions.id (points are tied to the submission id, not a task).
create table points_ledger (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  class_id    uuid not null references classes(id),
  teacher_id  uuid references profiles(id),
  value       int not null,
  reason      text,
  category    text,
  note        text,
  source_type text,                 -- e.g. 'submission' | 'manual'
  source_id   uuid,                 -- submissions.id when source_type='submission' (polymorphic ⇒ no hard FK)
  material_id uuid references learning_materials(id),
  created_at  timestamptz not null default now()
);
create index points_ledger_child_idx on points_ledger(child_id, created_at);
alter table points_ledger enable row level security;

-- Optional materialized progress per child/material. MVP MAY instead compute this
-- as a VIEW over points_ledger + learning_materials (then no writes are needed).
create table child_progress (
  child_id     uuid not null references children(id) on delete cascade,
  material_id  uuid not null references learning_materials(id) on delete cascade,
  earned_points int not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (child_id, material_id)
);
create trigger child_progress_set_updated_at before update on child_progress
  for each row execute function set_updated_at();
alter table child_progress enable row level security;

-- Per child per session attendance.
create table attendance_records (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references classes(id) on delete cascade,
  child_id     uuid not null references children(id) on delete cascade,
  session_date date not null,
  status       attendance_status not null,
  joined_at    timestamptz,
  manual       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (class_id, child_id, session_date)
);
create index attendance_records_class_date_idx on attendance_records(class_id, session_date);
create trigger attendance_records_set_updated_at before update on attendance_records
  for each row execute function set_updated_at();
alter table attendance_records enable row level security;

-- Append-only security/audit trail. Server-written (service role) only.
create table audit_events (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid,                 -- profiles.id or null for anon/system
  actor_role    text,
  action        text not null,        -- e.g. 'invitation.revoke', 'submission.delete'
  subject_table text,
  subject_id    uuid,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);
create index audit_events_subject_idx on audit_events(subject_table, subject_id);
create index audit_events_created_idx on audit_events(created_at);
alter table audit_events enable row level security;
