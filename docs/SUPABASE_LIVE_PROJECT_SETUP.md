# Supabase Live Project Setup

Step-by-step for connecting الأشبال to a real Supabase project and applying the
Phase 1a schema/RLS migrations. Written for a non-backend developer.

> **Status (as of this commit):** No live Supabase credentials are present in the
> build environment, so **migrations have NOT been applied to any live project**.
> The migrations are **validated locally** (all 8 apply cleanly against
> PostgreSQL 16; 24/24 tables have RLS, `child_device_grants` exists, `submissions`
> is unique per `(child_id, assignment_id)`, helper functions exist, the
> `recordings` bucket is private). Follow the steps below to apply them to YOUR
> project. Nothing in the app talks to Supabase yet — the app still runs entirely
> on localStorage and its behavior does not change.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → sign in → **New project**.
2. Pick an organization, a project name (e.g. `al-ashbal`), a strong database
   password (save it), and a region close to your users.
3. Wait for the project to finish provisioning (~1–2 min).

## 2. Copy the keys

In the Supabase dashboard → **Project Settings**:

- **API** tab:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **secret**
- **Database** tab (only if you use the CLI/`psql`): the connection string /
  password — keep it secret.

> ⚠️ The **service_role** key bypasses all security (RLS). Treat it like a root
> password. Never paste it into client code, never prefix it with `NEXT_PUBLIC_`,
> never commit it.

## 3. Add env vars locally (`.env.local`)

Create a file named **`.env.local`** in the project root (it is already
git-ignored — never commit it):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY   # server-only secret
SUPABASE_STORAGE_BUCKET_RECORDINGS=recordings
NEXT_PUBLIC_APP_URL=http://localhost:3000
# CHILD_GRANT_TOKEN_PEPPER=   # optional, server-only (Phase 5)
```

(See `.env.example` for the annotated template.)

## 4. Add env vars in Vercel (do this before deploying, later)

Vercel → your project → **Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
  → client-safe (they end up in the browser bundle by design).
- `SUPABASE_SERVICE_ROLE_KEY` (and `CHILD_GRANT_TOKEN_PEPPER` if used) →
  **add as server-only**; do NOT expose to the client / Preview client bundle.
- `SUPABASE_STORAGE_BUCKET_RECORDINGS=recordings`.

## 5. Apply the migrations

The SQL lives in `supabase/migrations/001…008.sql` (apply in numeric order).
Pick ONE method:

### Option A — Supabase SQL Editor (simplest, no tools)
1. Dashboard → **SQL Editor** → **New query**.
2. Open `supabase/migrations/001_extensions_and_enums.sql`, copy its contents,
   paste, **Run**.
3. Repeat for `002` → `008`, **in order** (each depends on the previous).

### Option B — Supabase CLI (repeatable)
```bash
npm install -g supabase        # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF   # from the dashboard URL
supabase db push               # applies supabase/migrations in order
# (local dev alternative: `supabase start` then `supabase db reset`)
```

> The migrations are **one-time / ordered** (not re-runnable individually) — use
> `db push` / the SQL editor once. To rebuild from scratch on a *local* stack use
> `supabase db reset`.

## 6. Verify (tables, RLS, functions, storage)

Two ways:

**Quick script** (uses the packages already installed; run only after step 3):
```bash
npm run verify:supabase
```
It checks: env vars present, connectivity, each core table reachable, and the
recordings bucket configured.

**Dashboard checklist** (authoritative):
- **Table Editor** → confirm all 24 tables exist (profiles, classes, children,
  invitations, `child_device_grants`, submissions, …).
- **Advisors** (or Database → Linter) → confirm **no "RLS disabled" warnings** on
  public tables (RLS must be ON for every app table).
- **Database → Functions** → confirm `has_child_grant`, `can_access_child`,
  `is_teacher_for_class`, `is_parent_of_child`, `is_child_in_teacher_class`.
- **SQL Editor** → run:
  ```sql
  select conname from pg_constraint where conname = 'submissions_child_assignment_uq'; -- 1 row
  select id, public from storage.buckets where id = 'recordings';                       -- public = false
  ```
- **Storage** → confirm a **`recordings`** bucket exists and is **Private**.

## 7. Never commit `.env.local`

`.gitignore` already ignores `.env` and `.env.*` (except `.env.example`). Double
check `git status` never shows `.env.local`. Rotate the service_role key
immediately if it is ever leaked.

---

## Verification checklist (tick before Teacher Auth)

- [ ] Supabase project created; URL + anon + service_role keys copied.
- [ ] `.env.local` created locally (git-ignored) with all 5 vars.
- [ ] Migrations `001`–`008` applied in order (SQL editor or CLI).
- [ ] All 24 tables present.
- [ ] Advisors show **no RLS-disabled** public tables.
- [ ] Helper functions present.
- [ ] `submissions_child_assignment_uq` unique constraint present.
- [ ] `recordings` bucket exists and is **Private**.
- [ ] `npm run verify:supabase` passes (with `.env.local` loaded).
- [ ] App still builds/runs (`npm run build`) unchanged (localStorage only).

Once every box is ticked, **Phase 2 (real teacher Auth)** can begin.
