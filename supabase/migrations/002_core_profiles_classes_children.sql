-- 002 — profiles, classes, children, and links.
-- RLS is ENABLED on every table here; policies live in 007_rls_policies.sql.

-- ---------------------------------------------------------------- profiles
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  display_name text not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_role_idx on profiles(role);
create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
alter table profiles enable row level security;

create table teacher_profiles (
  id         uuid primary key references profiles(id) on delete cascade,
  bio        text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger teacher_profiles_set_updated_at before update on teacher_profiles
  for each row execute function set_updated_at();
alter table teacher_profiles enable row level security;

create table parent_profiles (
  id         uuid primary key references profiles(id) on delete cascade,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger parent_profiles_set_updated_at before update on parent_profiles
  for each row execute function set_updated_at();
alter table parent_profiles enable row level security;

-- ---------------------------------------------------------------- classes
-- Internal teaching group ("halaqa" internally only — NEVER surfaced as a code
-- or selector in the UI). MVP seeds exactly one; schema supports many.
create table classes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid references profiles(id),
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger classes_set_updated_at before update on classes
  for each row execute function set_updated_at();
alter table classes enable row level security;

create table class_teachers (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  role       class_teacher_role not null default 'owner',
  created_at timestamptz not null default now(),
  unique (class_id, teacher_id)
);
create index class_teachers_teacher_idx on class_teachers(teacher_id);
alter table class_teachers enable row level security;

-- ---------------------------------------------------------------- children
-- A child profile (the unit submissions/points attach to). NOT an auth user.
create table children (
  id              uuid primary key default gen_random_uuid(),
  display_name    text not null,
  avatar_url      text,
  age             int,
  level           text,                       -- مبتدئ/متوسط/متقدم (free text)
  created_by_role child_created_by,
  via_invitation  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index children_display_name_idx on children(display_name);
create trigger children_set_updated_at before update on children
  for each row execute function set_updated_at();
alter table children enable row level security;

-- Enrolment of a child in a class (replaces CURRENT_HALAQA_ID / halaqaEnrollment).
create table class_students (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  child_id    uuid not null references children(id) on delete cascade,
  status      enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique (class_id, child_id)
);
create index class_students_class_idx on class_students(class_id, status);
create index class_students_child_idx on class_students(child_id);
alter table class_students enable row level security;

-- Which parent may see/act for which child.
create table parent_child_links (
  id        uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  child_id  uuid not null references children(id) on delete cascade,
  status    link_status not null default 'active',
  linked_at timestamptz not null default now(),
  unique (parent_id, child_id)
);
create index parent_child_links_parent_idx on parent_child_links(parent_id, status);
create index parent_child_links_child_idx  on parent_child_links(child_id, status);
alter table parent_child_links enable row level security;
