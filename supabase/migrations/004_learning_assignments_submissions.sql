-- 004 — teacher-authored learning content + the submissions workflow.
-- C2: submissions are UNIQUE per (child_id, assignment_id) — NOT keyed by task
-- globally (the demo's Record<taskId> overwrote siblings). C4: 'uploading' state +
-- server-generated recording_path. approvals / reviews / points reference
-- submissions.id.

-- ---------------------------------------------------------------- materials
create table learning_materials (
  id                    uuid primary key default gen_random_uuid(),
  class_id              uuid not null references classes(id) on delete cascade,
  name                  text not null,
  type                  text not null,             -- quran/tajweed/behavior/hadith/…
  icon_key              text,
  color_token           text,
  show_in_child_progress boolean not null default true,
  target_points         int not null default 0,
  sort_order            int not null default 0,
  archived              boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index learning_materials_class_idx on learning_materials(class_id, archived);
create trigger learning_materials_set_updated_at before update on learning_materials
  for each row execute function set_updated_at();
alter table learning_materials enable row level security;

create table lessons (
  id            uuid primary key default gen_random_uuid(),
  material_id   uuid not null references learning_materials(id) on delete cascade,
  -- denormalized for simpler RLS (avoid joining through the material):
  class_id      uuid not null references classes(id) on delete cascade,
  title         text not null,
  description   text,
  surah_or_topic text,
  verse_start   int,
  verse_end     int,
  default_points int not null default 0,
  allowed_submission_types text[] not null default '{}', -- audio/video/parent_check/teacher_check
  sort_order    int not null default 0,
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index lessons_material_idx on lessons(material_id, archived);
create index lessons_class_idx on lessons(class_id);
create trigger lessons_set_updated_at before update on lessons
  for each row execute function set_updated_at();
alter table lessons enable row level security;

-- Teacher's today/upcoming prep for a class.
create table daily_prep (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references classes(id) on delete cascade,
  teacher_id    uuid not null references profiles(id),
  title         text not null,
  subject       text,
  surah_or_topic text,
  ayah_from     text,
  ayah_to       text,
  objective     text,
  student_notes text,
  lesson_date   date not null,
  lesson_status prep_status not null default 'today',
  requirement_type text,
  submission_type  text,
  due_label     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index daily_prep_class_date_idx on daily_prep(class_id, lesson_date);
create trigger daily_prep_set_updated_at before update on daily_prep
  for each row execute function set_updated_at();
alter table daily_prep enable row level security;

-- Student tasks for a class (independent of prep).
create table assignments (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid not null references classes(id) on delete cascade,
  teacher_id      uuid not null references profiles(id),
  title           text not null,
  description     text,
  type            text not null,             -- recitation/memorization/review/reading/confirm
  submission_type text not null,             -- none/audio/video/audio_or_video
  due_label       text,
  status          assignment_status not null default 'active',
  material_id     uuid references learning_materials(id),
  lesson_id       uuid references lessons(id),
  points          int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index assignments_class_status_idx on assignments(class_id, status);
create trigger assignments_set_updated_at before update on assignments
  for each row execute function set_updated_at();
alter table assignments enable row level security;

-- ---------------------------------------------------------------- submissions
-- One active submission per child per assignment (C2). The blob lives in Storage
-- at a SERVER-generated recording_path (C4); the row is the source of truth.
create table submissions (
  id                   uuid primary key default gen_random_uuid(),
  assignment_id        uuid references assignments(id),       -- nullable; see source_type
  source_type          submission_source not null default 'assignment',
  source_id            uuid,                                   -- prep/lesson id when not an assignment
  class_id             uuid not null references classes(id),
  child_id             uuid not null references children(id) on delete cascade,
  submitted_by_parent_id uuid references profiles(id),         -- NOT the authz source (links are)
  submitted_via_grant_id uuid,                                 -- FK added in 006 (child_device_grants)
  teacher_id           uuid references profiles(id),
  title                text not null,
  recording_path       text,                                   -- Storage object path (server-generated)
  recording_type       recording_kind,
  duration_seconds     int,
  state                submission_state not null default 'uploading',
  note                 text,
  material_id          uuid,
  lesson_id            uuid,
  points               int,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  -- C2: one active submission per child per assignment (NULL assignment_id ⇒ ad-hoc,
  -- not constrained — multiple ad-hoc rows allowed since NULLs are distinct).
  constraint submissions_child_assignment_uq unique (child_id, assignment_id)
);
create index submissions_child_idx        on submissions(child_id);
create index submissions_teacher_state_idx on submissions(teacher_id, state);
create index submissions_class_state_idx  on submissions(class_id, state);
create trigger submissions_set_updated_at before update on submissions
  for each row execute function set_updated_at();
alter table submissions enable row level security;

-- Audit of the parent decision (submissions.state is the live value).
create table parent_approvals (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  parent_id     uuid not null references profiles(id),
  decision      approval_decision not null,
  note          text,
  created_at    timestamptz not null default now()
);
create index parent_approvals_submission_idx on parent_approvals(submission_id);
alter table parent_approvals enable row level security;

-- The teacher's review/grade of a submission (one active review per submission).
create table teacher_reviews (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  teacher_id    uuid not null references profiles(id),
  decision      review_decision not null,
  note          text,
  awarded_points int not null default 0,
  created_at    timestamptz not null default now(),
  unique (submission_id)
);
alter table teacher_reviews enable row level security;
