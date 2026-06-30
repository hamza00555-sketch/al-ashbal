# Supabase Backend Architecture — Red-Team Review

> Review only. No backend implemented, no packages, no migrations, no app/UI
> changes. Reviews `SUPABASE_BACKEND_ARCHITECTURE_PLAN.md`,
> `SUPABASE_SCHEMA_DRAFT.md`, `SUPABASE_RLS_POLICY_DRAFT.md`,
> `BACKEND_MIGRATION_PHASES.md` against the current code at `079dac4`.
> Posture: challenge the plan, not defend it.

---

## 1. Executive verdict

**NEEDS REVISION (not blocked).** The overall architecture (Supabase Auth +
Postgres + RLS + private Storage, RPCs for business-rule writes, child-as-profile
in MVP) is sound and the RLS *intent* is mostly correct. But there are **two
Critical gaps that affect the schema you would migrate first**, plus several High
items, that must be corrected in the docs **before** writing any migration:

1. The **child / device access primitive is undefined** — RLS for the child path
   is hand-waved ("a server action scoped to the active child id"). There is no
   concrete server-side proof a device may act for a child. This is the core of
   the whole product (shared family device) and the biggest hole.
2. The **`submissions` schema has no uniqueness per (child, assignment)** and would
   inherit a real current bug: the demo keys submissions **globally by `taskId`**
   (`Record<string, Submission>`, `map[sub.taskId]`), so two siblings submitting
   the same assignment **overwrite each other**. The backend must key per child.

Fix the doc corrections in §3, then Phase 1a (infra + schema) is safe to start.

---

## 2. Top 10 risks (ranked)

### Critical
1. **Undefined child-device access model (RLS hole).** `SUPABASE_RLS_POLICY_DRAFT.md`
   authorizes the child path with prose ("server action scoped to the active child
   id from the device token") but defines no table, token, or SQL predicate. As
   written, either (a) child reads/writes have *no* enforceable server check, or
   (b) they fall back to "trust the client's `activeChildId`" — exactly what the
   plan says not to do. Without a concrete `has_child_grant(child_id)` primitive,
   a device could read/submit for **any** child id it names.
2. **`submissions` not unique per (child, assignment) → sibling overwrite.** Current
   `submissions.ts` is `Record<taskId, Submission>` and `upsertSubmission` writes
   `map[sub.taskId]` — global by task, not by child. Two children of one device
   submitting the same assignment overwrite each other (silent data loss / wrong
   identity). The schema's `submissions` table has no `UNIQUE(child_id, assignment_id)`
   and the plan doesn't flag this. Carrying the demo keying forward corrupts the
   exact "submission stored under the correct child" guarantee.

### High
3. **Invitation code entropy + brute force + collision retry.** Codes are
   `rand4()` → 4 base36 chars (~1.6M space, and visually short like `FAM-8K42`).
   `validate_invitation(code)` is anonymous → enumerable/guessable without strong
   **rate limiting**. Also the unique constraint will occasionally reject a
   colliding new code; the create RPC must **retry on unique violation**. Plan
   mentions neither rate limiting nor retry; code length is too short for an
   anon-callable lookup.
4. **Child-access (TLB) & parent-link (WLD) codes never expire or rotate.** In the
   demo `getOrCreateChildCode` returns the **same code forever** (permanent bearer
   secret). The plan's "short-lived grant" is for the *device session*, but the
   *code itself* is the long-lived credential that mints grants. A leaked TLB code
   = permanent access to that child. Needs expiry, rotation, and ideally
   single-activation or per-use throttling.
5. **Recording upload ↔ submission row desync + client-chosen path.** Storage upload
   and the `submissions` row are two writes (the demo already does `saveRecording`
   then `upsertSubmission`). On the backend an orphan blob (row insert fails) or a
   row pointing at a missing/foreign blob is possible. If the object **path is
   chosen by the client** (`…/{child_id}/…`), a client could target another child's
   folder. Upload authorization + path must be **server-minted**, and the
   row↔file lifecycle must be ordered and reconciled.
6. **Client-provided ids trusted by write RPCs.** `submit_recording`,
   `approveSubmissionAsParent`, `createChildAccessCode`, `getChildDashboard` take
   `childId` from the client. They are only safe if the server re-derives
   authorization (`is_linked_parent` / a real child grant) — which depends on
   risk #1 being fixed. Until the grant primitive exists, these are unsafe.

### Medium
7. **Self-registered student with no linked parent has no approval path.** Demo
   bakes `parentUserId = child.parentIds[0] ?? ""` (empty for student-registered
   children). The plan correctly authorizes approval via `parent_child_links`
   (good — this *fixes* the demo bug), but doesn't define what happens when **no
   parent is linked yet**: who approves the student's first submission? Needs an
   explicit rule (e.g. submission goes straight to teacher review, or is blocked
   until a parent links).
8. **`submissions.assignment_id` is a single FK but submissions have 3 sources.**
   The demo creates submissions from `assignments`, `daily_prep` tasks, and seed
   `childTasks`. A single `assignment_id` FK can't represent prep/ad-hoc tasks
   cleanly; needs `source_type` + `source_id` (or nullable `assignment_id` /
   `prep_id` / `lesson_id` with a check).
9. **Phase 1 is mis-scoped as "no behavior change."** Phase 1 bundles "schema +
   the data-access seam." Adding the seam (`src/lib/data` adapters that every page
   calls) is a **repo-wide refactor**, not a no-op. Real "zero app change" is only
   the infra+schema+RLS. Conflating them risks a big, risky first PR.

### Low
10. **Deferred concepts leave visible gaps + minor schema friction.**
    `notifications`, class `activities`/`activity_answers` are deferred — fine, but
    the child "active activity" card and the notification bell won't function until
    added (document as a known MVP gap). Minor: `lessons` resolves `class_id`
    through its material, making lesson RLS a join; denormalizing `class_id` onto
    `lessons` simplifies policies. The attendance "gate" (graceMinutes/meetUrl) is
    dropped — acceptable for MVP if noted.

---

## 3. Required corrections before implementation (must-fix, doc edits)

Apply these to the planning docs **before** writing migrations (they change the
schema/RLS you'd generate):

**C1 — Define the child-device access primitive (fixes risk #1, #6).** Add to the
schema + RLS drafts:
```sql
-- child_device_grants: a revocable, expiring capability that a device proved by
-- redeeming a child-access (TLB) code. Server-issued only.
create table child_device_grants (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  device_id text not null,            -- opaque per-device id (client-generated, stored hashed)
  token_hash text not null,           -- hash of the bearer grant token
  expires_at timestamptz not null,    -- e.g. now() + 30 days, slidable
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index on child_device_grants (child_id);
-- predicate usable by RLS / server checks:
create function has_child_grant(child uuid) returns boolean language sql stable
security definer set search_path = public as $$
  select exists (
    select 1 from child_device_grants g
    where g.child_id = child and g.revoked_at is null and g.expires_at > now()
      and g.token_hash = current_setting('app.child_grant_hash', true)
  );
$$;
```
Then every child-path policy/RPC uses `is_linked_parent(child_id) OR
is_childs_class_teacher(child_id) OR has_child_grant(child_id)`. The grant token is
set per-request (server action sets `app.child_grant_hash`, or the server action
validates it directly and uses service role). Document that `activeChildId` stays
local but is **never** the authorization — the grant is.

**C2 — Make submissions per-child (fixes risk #2).** In `SUPABASE_SCHEMA_DRAFT.md`
add `UNIQUE (child_id, assignment_id)` (or `UNIQUE (child_id, assignment_id,
attempt_no)` if re-records create new rows) and a note: **do not** key submissions
by task/assignment alone. Add `source_type text + source_id uuid` (risk #8) and
make `assignment_id` nullable.

**C3 — Invitation guardrails (fixes risk #3).** In the invitation model + RPC plan:
lengthen codes (e.g. 6–8 unambiguous chars), **rate-limit** `validate_invitation`
and the register RPCs per IP/code, and make the create RPC **retry on unique
violation**. Keep the atomic counter guard *inside the same transaction* as the
child inserts (already implied — make it explicit: `SELECT … FOR UPDATE` the
invitation row, or the conditional `UPDATE … WHERE used+ N <= max RETURNING`).

**C4 — Code expiry/rotation (fixes risk #4).** Add `expires_at` (and optional
`rotated_at`) to `child_access_codes` and `parent_link_codes`; define rotation
(parent can regenerate a child's code, invalidating the old) and that redeeming a
code mints a grant rather than granting access directly.

**C5 — Recording upload flow (fixes risk #5).** Specify the exact order in the
storage plan: (1) server action authorizes the caller for `child_id`; (2) insert
`submissions` row `state='uploading'` with a **server-generated** `recording_path`;
(3) mint a short-lived **signed upload URL** for that path only; (4) client uploads;
(5) client calls `finalizeSubmission` → server verifies the object exists →
`state='pending_parent'`. Add an orphan-reconciliation note (delete `uploading`
rows + objects older than N minutes). Never let the client choose the path.

**C6 — No-parent-yet approval rule (fixes risk #7).** Document: a student with no
active `parent_child_links` row → their submission goes directly to
`pending_teacher` (skip parent approval) OR is blocked with a prompt to link a
parent first. Pick one; recommended: **go straight to teacher review** so the
student isn't stuck, and let a later-linked parent see history read-only.

**C7 — Split Phase 1 (fixes risk #9).** In `BACKEND_MIGRATION_PHASES.md`, split:
- **Phase 1a** — Supabase project, browser/server clients, env vars, **schema +
  RLS + helper functions + RPC stubs**. Zero app/page changes. Truly no behavior
  change.
- **Phase 1b** — introduce the `src/lib/data` data-access seam (read-through,
  writes still local) behind `NEXT_PUBLIC_BACKEND`. This is a refactor; treat it
  as its own phase with its own QA.

---

## 4. Optional improvements (can wait)

- Denormalize `class_id` onto `lessons` to simplify RLS (avoid a join through
  material).
- Add `notifications`, `activities`, `activity_answers` tables post-MVP (document
  the temporary functional gap for the child activity card + bell).
- Replace `child_progress` table with a VIEW over `points_ledger` +
  `learning_materials` to avoid write-time maintenance.
- Add `attendance_sessions` (gate: open/close/grace/meetUrl) only if the live
  attendance gate is needed in the MVP.
- Consider `citext`/normalized-upper unique index for all codes to make
  case-insensitivity a DB guarantee, not app code.
- Add DB-level `check` that `submissions.state` transitions are valid (or enforce
  only in the RPC).

---

## 5. Final recommended implementation order (revised)

1. **Phase 1a** — Supabase infra + **schema (with C1–C6 corrections) + RLS +
   helper fns + RPC stubs**. No app changes.
2. **Phase 1b** — data-access seam (`src/lib/data` adapters) behind a flag,
   read-through, writes still local.
3. **Phase 2** — real teacher Auth + server-side route protection (middleware),
   replacing the local teacher gate.
4. **Phase 3** — backend invitations + `/join` (create/validate/revoke RPCs,
   real code lookup; drop the portable `demoInvite` payload).
5. **Phase 4** — family + student registration RPCs (parent auth, children,
   links, class enrolment, codes, counters) — consider splitting parent-auth
   creation from child creation.
6. **Phase 5** — child switcher on backend children + **child-device grants
   (C1)**; `activeChildId` stays local.
7. **Phase 6** — materials / lessons / prep / assignments to backend.
8. **Phase 7** — recordings → private Storage + `submissions` (C2, C5).
9. **Phase 8** — points / progress / attendance.

(Order matches the plan except: Phase 1 is split, and the child-grant primitive is
pulled in explicitly at Phase 5 where the child path first reads backend data.)

---

## 6. Clear answers

**Q: Should we start Phase 1 now?** **Yes — Phase 1a only**, after applying doc
corrections **C1, C2** (and ideally C3–C6) to the schema/RLS drafts, because those
change the tables you migrate. C7 (splitting Phase 1) is itself a doc fix that
makes "start now" honest.

**Q: Exact first task if yes?** Create the Supabase project; add browser + server
clients and env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
server-only `SUPABASE_SERVICE_ROLE_KEY`); write the **first migration**: all tables
from `SUPABASE_SCHEMA_DRAFT.md` **including `child_device_grants` (C1)** and the
`submissions UNIQUE(child_id, assignment_id)` (C2), with **RLS enabled on every
table**, the helper predicates (`is_class_teacher`, `is_linked_parent`,
`is_childs_class_teacher`, `has_child_grant`), and empty `SECURITY DEFINER` RPC
stubs. Seed one `classes` row. **No page/UI changes.** Verify with Supabase
advisors that RLS is on for all tables.

**Q: If no, what must be fixed in the docs first?** (Pre-req before even Phase 1a):
C1 (child-device grant table + predicate) and C2 (submissions per-child uniqueness)
— both are schema-level. C3–C6 should land before the RPCs are written; C7 before
the first PR is scoped.

---

## Appendix — red-team Q&A summary

- **Schema:** all current localStorage concepts are mapped; the legacy halaqa-code
  store is correctly dropped. Gaps: child-grant table missing (C1), submissions
  uniqueness/source missing (C2/#8), `notifications`/`activities` deferred (#10).
  Nothing is over-complicated for MVP; multi-class generality is correct (no UI).
- **RLS/security:** parent→other child = blocked; teacher→out-of-class = blocked;
  anon→enumerate invitations = blocked *if* rate-limited (#3); parent approving
  another child = blocked; teacher reviewing out-of-class = blocked; **child/device
  → other child = NOT yet enforceable (C1, Critical)**; upload-for-other-child =
  unsafe until C1+C5. RLS-on-all-tables = yes (good). Direct client writes are
  correctly routed through RPCs for business rules.
- **Child access model:** keep **child-as-profile (Option A)** for the closed MVP —
  it matches the product and is acceptable **only after** C1 (concrete grant) and
  C4 (code expiry/rotation). Siblings can't submit as each other server-side once
  grants are per-child and `submit_recording` checks the grant. Future: promote
  `children.user_id` for older self-login students.
- **Invitations:** maxChildren + single-use logic are correct with an atomic,
  transactional counter guard; add code entropy, rate limiting, and create-RPC
  collision retry (C3). Lookup/use must be RPC-only and transactional (already
  intended).
- **Recordings:** private bucket + signed URLs is right; must be server-minted path
  + ordered row→upload→finalize + orphan cleanup; deletion server/retention only
  (C5).
- **Migration phases:** Phase 1 is safe **only if split** (1a infra/schema vs 1b
  seam, C7); Auth-after-schema is fine (nothing reads tables until Phase 3);
  invitations-before-submissions is correct; Phase 4 is large and may split.
