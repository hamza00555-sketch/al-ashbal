# Supabase backend — الأشبال

**Phase 1a foundation only.** These migrations define the database schema, RLS,
helper functions, and the private recordings bucket. **They are NOT wired to the
app** — the app still runs entirely on localStorage and behaves exactly as before.
Nothing in `src/` imports Supabase yet.

Source of truth: `docs/SUPABASE_BACKEND_ARCHITECTURE_PLAN.md` and the supporting
schema / RLS / phases drafts (with the red-team corrections C1–C5 applied).

## Migration order

Apply in numeric order (each builds on the previous):

1. `001_extensions_and_enums.sql` — pgcrypto, enum types, `set_updated_at()` trigger.
2. `002_core_profiles_classes_children.sql` — profiles, classes, children, links.
3. `003_invitations_and_codes.sql` — invitations + child-access / parent-link codes.
4. `004_learning_assignments_submissions.sql` — materials, lessons, prep,
   assignments, **submissions (UNIQUE child_id+assignment_id — C2)**, approvals, reviews.
5. `005_points_progress_attendance.sql` — points ledger, progress, attendance, audit.
6. `006_child_device_grants_and_helpers.sql` — **child_device_grants (C1)** + the
   authorization helpers (`is_teacher_for_class`, `is_parent_of_child`,
   `is_child_in_teacher_class`, `has_child_grant`, `can_access_child`).
7. `007_rls_policies.sql` — RLS policies (deny-by-default; narrow policies only).
8. `008_storage_recordings.sql` — private `recordings` bucket + access notes.

RLS is **enabled on every table** in 002–006; policies are added in 007. Tables
with no policy for a given action are **denied by default** (those writes go
through SECURITY DEFINER RPCs / server actions in later phases).

## Local setup (when you actually run this — later)

These were authored for Phase 1a and have **not** been executed against a live
database yet. When ready:

```bash
# Option A — Supabase CLI (recommended)
supabase init           # if not already initialised
supabase start          # local stack (Docker)
supabase db reset       # applies supabase/migrations in order
# or push to a linked project:
supabase db push

# Option B — paste each migration into the SQL editor in order (001 → 008).
```

After applying, verify with the linter/advisors that **RLS is ON for every
table** and there are no "policy exists RLS disabled" / "RLS enabled no policy"
surprises on tables that should be reachable.

## Env vars (see `.env.example`)

| Var | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client-safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client-safe (RLS-bound) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only secret — never expose to client; bypasses RLS** |
| `SUPABASE_STORAGE_BUCKET_RECORDINGS` | `recordings` |
| `NEXT_PUBLIC_APP_URL` | client-safe |

## Safety notes

- **Service role key is server-only.** Never import it into client components or
  prefix it with `NEXT_PUBLIC_`. It bypasses RLS.
- **`child_device_grants` stores only a token HASH** (C1). The raw grant token
  lives on the device. A client-supplied `child_id`/`activeChildId` never
  authorizes anything — `has_child_grant` / `can_access_child` do.
  `has_child_grant` reads the per-request GUC `request.child_grant_token_hash`,
  which a **Phase 1b server action must set** (or validate the grant server-side).
  Until wired, the child/device path is **denied**, not silently allowed.
- **submissions are unique per `(child_id, assignment_id)`** (C2) — no global
  task-id keying; siblings can't overwrite each other.
- **Recordings bucket is private** (008); access is via server-minted signed URLs
  only. Object-level storage policies are documented placeholders to complete in
  Phase 7.
- Anonymous users **cannot enumerate invitations / codes** — validation and use
  go through SECURITY DEFINER RPCs (Phase 3), not table SELECTs.

## Data-access layer (Phase 1b — not wired)

The TypeScript scaffolding that will talk to this database lives in
`src/lib/supabase/` (clients + env + types) and `src/lib/backend/` (typed
data-access functions). It is **not imported by the app yet**. The child-device
grant strategy (raw token on device, hash in DB, server-side validation —
resolving audit findings H1/H2) is implemented in
`src/lib/backend/childDeviceGrants.ts`. See
`docs/SUPABASE_PHASE_1B_DATA_ACCESS_NOTES.md`.
