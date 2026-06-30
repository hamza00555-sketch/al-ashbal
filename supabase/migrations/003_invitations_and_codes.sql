-- 003 — invitations + the three code kinds (invitation / child-access / parent-link).
-- C3: codes are SERVER-generated, expirable, revocable, rotatable. Anonymous
-- users must NEVER enumerate these tables (enforced in 007 — deny by default).

-- ---------------------------------------------------------------- invitations
create table invitations (
  id                    uuid primary key default gen_random_uuid(),
  type                  invitation_type not null,
  -- C3: server-generated with sufficient entropy (lengthen beyond the demo's
  -- 4 random chars; FAM-/STD- prefix may stay). Never trust a client code.
  code                  text not null,
  label                 text,
  class_id              uuid not null references classes(id),
  created_by_teacher_id uuid not null references profiles(id),
  max_children          int not null default 1,
  max_parents           int not null default 1,
  used_children_count   int not null default 0,
  used_parents_count    int not null default 0,
  expires_at            timestamptz,
  revoked_at            timestamptz,
  used_at               timestamptz,   -- set when fully used (student single-use)
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- atomic guards rely on these never going negative / over max:
  constraint invitations_counts_chk check (
    used_children_count >= 0 and used_parents_count >= 0
    and used_children_count <= max_children
  )
);
-- case-insensitive uniqueness on the code:
create unique index invitations_code_uq on invitations(upper(code));
create index invitations_teacher_idx on invitations(created_by_teacher_id);
create index invitations_class_idx   on invitations(class_id);
create trigger invitations_set_updated_at before update on invitations
  for each row execute function set_updated_at();
alter table invitations enable row level security;

-- Audit each successful use (server-written only).
create table invitation_uses (
  id                uuid primary key default gen_random_uuid(),
  invitation_id     uuid not null references invitations(id) on delete cascade,
  used_by_parent_id uuid references profiles(id),
  child_id          uuid references children(id),
  created_at        timestamptz not null default now()
);
create index invitation_uses_invitation_idx on invitation_uses(invitation_id);
alter table invitation_uses enable row level security;

-- ---------------------------------------------- child_access_codes (TLB-)
-- A short-lived code a child redeems to MINT a child_device_grant (006). It does
-- NOT grant access by itself. Parent can regenerate it (rotation revokes old).
-- NOTE: these are short PUBLIC codes shared over WhatsApp, so the value is stored
-- as-is for lookup; they are expirable/revocable + rate-limited at the RPC layer.
-- (If they were long secrets we would store only a hash — see child_device_grants.)
create table child_access_codes (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  code         text not null,
  expires_at   timestamptz,
  revoked_at   timestamptz,
  rotated_at   timestamptz,
  last_used_at timestamptz,
  created_at   timestamptz not null default now()
);
create unique index child_access_codes_code_uq on child_access_codes(upper(code));
create index child_access_codes_child_idx on child_access_codes(child_id);
alter table child_access_codes enable row level security;

-- ---------------------------------------------- parent_link_codes (WLD-)
-- A self-registered student's code so a parent can claim/link them. Single-consume,
-- expirable, regenerable. (Same public-code note as above.)
create table parent_link_codes (
  id                  uuid primary key default gen_random_uuid(),
  child_id            uuid not null references children(id) on delete cascade,
  code                text not null,
  consumed_by_parent_id uuid references profiles(id),
  consumed_at         timestamptz,
  expires_at          timestamptz,
  revoked_at          timestamptz,
  created_at          timestamptz not null default now()
);
create unique index parent_link_codes_code_uq on parent_link_codes(upper(code));
create index parent_link_codes_child_idx on parent_link_codes(child_id);
alter table parent_link_codes enable row level security;
