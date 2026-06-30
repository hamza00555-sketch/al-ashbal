# Supabase Phase 1a — Implementation Notes

**Branch:** `claude/pensive-hypatia-k6qnf3` · built on docs commit `b3d697e`.
**Scope:** schema + RLS + helper functions + private storage bucket + env template.
**Behavior change:** **none.** The app still runs 100% on localStorage; no `src/`
file imports Supabase. ⚠️ **App behavior must not change in this phase.**

---

## What was added

- `supabase/migrations/001_extensions_and_enums.sql` … `008_storage_recordings.sql`
  — the full schema, RLS policies, authorization helpers, and the private
  `recordings` bucket (see `supabase/README.md` for the per-file breakdown).
- `supabase/README.md` — migration order, local setup, env vars, safety notes.
- `.env.example` — added the Supabase vars (client-safe vs server-only marked).
- `docs/SUPABASE_PHASE_1A_IMPLEMENTATION_NOTES.md` — this file.

24 tables: `profiles`, `teacher_profiles`, `parent_profiles`, `classes`,
`class_teachers`, `children`, `class_students`, `parent_child_links`,
`invitations`, `invitation_uses`, `child_access_codes`, `parent_link_codes`,
`child_device_grants`, `learning_materials`, `lessons`, `daily_prep`,
`assignments`, `submissions`, `parent_approvals`, `teacher_reviews`,
`points_ledger`, `child_progress`, `attendance_records`, `audit_events`.

## Red-team corrections honored

- **C1 — `child_device_grants`** + `has_child_grant()` / `can_access_child()`.
  The child/device path is authorized by a grant token hash (per-request GUC),
  never by a client-supplied `child_id`. Raw token is **not** stored.
- **C2 — `submissions UNIQUE(child_id, assignment_id)`** (+ `source_type`/`source_id`);
  no global task-id keying. `parent_approvals`, `teacher_reviews`, and
  `points_ledger` (`source_id`) reference `submissions.id`.
- **C3 — codes**: server-generated, case-insensitive unique, expirable/revocable/
  rotatable; anon cannot enumerate (deny-by-default; RPC-only use).
- **C4 — recordings**: `submissions.state='uploading'` first; server-generated
  path; private bucket; signed-URL access (storage policies are Phase-7 placeholders).
- **C5 — Phase split**: this is Phase 1a (schema/RLS only). Phase 1b is the data
  layer.

## How to apply the migrations (later)

Not executed against a live DB yet. When ready: `supabase db reset` (local) or
`supabase db push` (linked project), or paste 001→008 into the SQL editor in
order. Then verify RLS is ON for every table via the Supabase advisors. Full steps
in `supabase/README.md`.

## What is NOT wired yet (intentionally)

- No Supabase client in `src/` — no browser/server client utilities yet.
- No Auth (teacher still uses the local code gate; parents/children unchanged).
- No invitations/registration/recording backend; `/join`, the child switcher, the
  teacher area, submissions all still use localStorage.
- No data migration from localStorage → Supabase.
- No RPCs/server actions yet (only SQL helper functions exist). The
  `has_child_grant` GUC (`request.child_grant_token_hash`) is **not set by anyone
  yet** → the child/device path would be denied if it were live (safe default).
- Storage object-level policies are documented placeholders (Phase 7).

## What remains localStorage (unchanged this phase)

Everything the app uses today: teacher session, invitations, created children,
parent-child links, device child ids, active child id, codes, materials, lessons,
prep, assignments, submissions, recordings (IndexedDB), reviews, points, progress,
attendance, notifications, activities.

## Known limitations

- SQL authored but **not executed** against a live Supabase database (no project
  in this environment) — see "Validation" in the report.
- `has_child_grant` depends on a per-request GUC that a Phase 1b server action
  must set; until then the child/device path is denied (not a leak).
- `child_access_codes` / `parent_link_codes` store the short PUBLIC code value for
  lookup (they are expirable/revocable + RPC-rate-limited); long secret tokens
  (grants) are hash-only.
- `child_progress` is a table for now; MVP may replace it with a VIEW over
  `points_ledger`.

## Next phase: Phase 1b — data-access layer scaffolding

Introduce typed Supabase browser/server client utilities and a `src/lib/data/*`
adapter seam (behind `NEXT_PUBLIC_BACKEND`), reading/writing **localStorage** while
`flag=local` — i.e. still **no user-facing behavior change**. Then later phases
swap one adapter at a time to Supabase. See `docs/BACKEND_MIGRATION_PHASES.md`.
