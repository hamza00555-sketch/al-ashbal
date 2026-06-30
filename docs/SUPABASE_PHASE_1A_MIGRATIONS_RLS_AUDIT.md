# Supabase Phase 1a — Migrations & RLS Audit

> Audit/review of the Phase 1a foundation at commit `79cd877`. **No app behavior,
> UI, or migrations were changed** (no critical blocker found that warranted a
> small in-place fix). The migrations were **re-run and adversarially probed**
> against a local PostgreSQL 16 with Supabase-like stubs.

---

## 1. Verdict

**PASS WITH NOTES.** The schema and RLS are correct and safe for Phase 1a: RLS is
enabled on all 24 tables, deny-by-default holds, and adversarial probes confirm
anon/parent/teacher isolation. There are **no Critical issues**. Two **High** items
are design-completion tasks for Phase 1b (they are *safe denies* today, not leaks)
and a few Medium/Low hardening notes. **Phase 1b can start.**

## How it was validated

Ran a temporary Postgres 16 with stubs: `anon`/`authenticated`/`service_role`
roles, `auth.uid()` reading a per-request GUC, and `storage` schema. Applied
`001`–`008` cleanly, seeded two **isolated** families/classes (P1↔ChildA↔C1↔T1 and
P2↔ChildB↔C2↔T2), then probed RLS as each role. Results:

| Probe | Expected | Got |
|---|---|---|
| anon SELECT invitations / children / submissions | 0 | **0 / 0 / 0** ✅ |
| P1 reads own children | 1 | **1** ✅ |
| P1 reads ChildB / P2 reads ChildA | 0 | **0 / 0** ✅ |
| T1 reads own-class child / own invitation | 1 / 1 | **1 / 1** ✅ |
| T2 reads ChildA / T1's invitation | 0 / 0 | **0 / 0** ✅ |
| `has_child_grant(A)` right / wrong token | t / f | **t / f** ✅ |
| **anon device + valid grant reads ChildA** | (see H1) | **0** ⚠️ |
| `using(true)` / `with check(true)` anywhere | none | **none** ✅ |
| policies missing explicit role (→ PUBLIC) | none | **none** (all `to authenticated`) ✅ |
| storage.objects policies on `recordings` | 0 (deny) | **0** ✅ |
| tables RLS-on with zero policies (full deny) | audit_events only | **audit_events** ✅ |
| submissions client write policies | none (RPC-only) | **SELECT only** ✅ |

Static schema checks also re-confirmed: 24/24 tables RLS-on; `submissions
UNIQUE(child_id, assignment_id)`; `child_device_grants` stores `grant_token_hash`
(no raw token column); `parent_approvals` + `teacher_reviews` FK → `submissions`;
`points_ledger.source_id` references `submissions.id` by convention.

---

## 2. Critical findings (must fix before Phase 1b)

**None.** No SQL error, no broad anonymous access, no `using(true)`, no raw token
storage, no missing RLS, no service-role key in client code.

## 3. High findings (should resolve as Phase 1b builds the relevant path)

> Both are **safe today** (deny-by-default) — they are design decisions to make
> before the child/device + grant code is written, not Phase 1a security holes.

**H1 — The device-grant read path is non-functional for the real device role.**
- *Where:* `007_rls_policies.sql` — every child-scoped policy is `to authenticated`
  and uses `can_access_child()` (which includes `has_child_grant`).
- *Issue:* a device that holds only a child grant token (no Supabase Auth session)
  connects as the **`anon`** role. `to authenticated` policies never apply to
  `anon`, so even a **valid** grant yields 0 rows (probe confirmed). The grant
  branch of `can_access_child` is therefore dead for the actual device role.
- *Impact:* not a leak (it denies). But if Phase 1b expects a device to read child
  data via direct client `select`, it will silently get nothing.
- *Recommended fix (Phase 1b — pick one, document it):*
  1. **Server-action path (preferred):** child/device reads/writes go through
     server actions using the **service role** *after* the server validates the
     grant token; RLS policies stay `to authenticated` as belt-and-suspenders. OR
  2. **Anon grant policies:** add explicit `... for select to anon using
     (has_child_grant(child_id))` policies on the child-scoped read tables, so an
     anon device presenting a grant can read directly.

**H2 — `has_child_grant` compares the presented value directly to the stored hash.**
- *Where:* `006_child_device_grants_and_helpers.sql` — `g.grant_token_hash =
  nullif(current_setting('request.child_grant_token_hash', true), '')`.
- *Issue:* the value presented per request must equal the **stored** `grant_token_hash`.
  So the stored hash doubles as the presented credential: a read leak of
  `child_device_grants` would allow impersonation, and the "hash-only storage"
  benefit is lost. It also assumes some layer sets `request.child_grant_token_hash`
  to the hash — a client-set GUC must never be trusted.
- *Impact:* none in Phase 1a (no one sets the GUC; the path denies). Matters when
  the grant is wired.
- *Recommended fix (Phase 1b):* validate the **raw** token server-side (service
  role) and do not rely on a client-set GUC; OR, if using the GUC, pass the **raw**
  token and hash it *inside* the function
  (`encode(digest(current_setting('request.child_grant_token'),'sha256'),'hex') =
  g.grant_token_hash`) so the stored hash is never the presented credential. Update
  `docs/SUPABASE_RLS_POLICY_DRAFT.md` accordingly.

## 4. Medium / Low findings (can wait if documented)

**M1 — `children` UPDATE is not column-restricted.** `children_update` lets a
linked parent/teacher update *any* column (e.g. `via_invitation`, `created_by_role`),
but the plan intended only display_name/avatar/age/level. RLS can't restrict
columns; Phase 1b should edit children via an RPC (or `GRANT UPDATE(col,…)` +
revoke table update). (`007`.)

**M2 — `parent_approvals` client INSERT can desync from `submissions.state`.** A
parent can insert an approval row directly, but `submissions` has no client
write policy, so the state transition only happens via an RPC. Phase 1b: do parent
approval in ONE RPC that writes the audit row **and** transitions state atomically;
consider dropping the standalone client insert policy. (`007`.)

**L1 — `is_child_in_teacher_class` ignores `class_students.status`.** A `left`
student still counts as in the teacher's class, whereas `can_access_class_content`
filters `status='active'`. Align (add `cs.status='active'`). (`006`.)

**L2 — `teacher_reviews` `for all` allows teacher DELETE.** Intended append-only.
Restrict to insert/update (or enforce in the review RPC). (`007`.)

**L3 — `points_ledger` direct teacher INSERT is allowed (not RPC-only).** Any class
teacher can insert points from the client, not only via review acceptance.
Acceptable (teacher is trusted for their class) but note it diverges from
"points via RPC on review acceptance." (`007`.)

**L4 — Migrations are one-time, not idempotent** (except `001` enums via
DO/EXCEPTION and `008` `on conflict`). Re-running `002`–`007` fails on duplicate
objects. This is normal for ordered migrations — use `supabase db reset` / `db
push`; don't re-run a file. Documented here for clarity.

**L5 — SECURITY DEFINER `search_path = public`.** Functional and the common
Supabase pattern, but `set search_path = ''` with schema-qualified names is
stricter against search-path hijacking. Low risk; optional hardening.

---

## 5. RLS safety summary

- **RLS enabled on all 24 app tables** (verified). Deny-by-default; `audit_events`
  and `storage.objects` (recordings) have **no** client policy → fully denied.
- **No `using(true)` / `with check(true)`** and **no policy defaults to PUBLIC**
  (all `to authenticated`) — so anon is denied unless an explicit anon path is
  added (see H1).
- **Anonymous enumeration blocked** for invitations, children, submissions, codes
  (probed → 0 rows). Invitation validation/use is intended to be RPC-only.
- **Parent isolation** and **teacher class isolation** verified by probe.
- **Submissions writes are RPC-only** (only a SELECT policy exists).
- **Helper functions** are `SECURITY DEFINER` (needed to avoid policy recursion),
  `stable`, `set search_path = public`; they enforce `auth.uid()` / grant and do
  not trust a bare client `child_id`. No SQL-injection surface (no dynamic SQL;
  uuid-typed args). Caveat H2 on the grant-comparison shape.

## 6. Storage safety summary

- `recordings` bucket is **private** (`public=false`), with a 50 MB size cap and a
  MIME allow-list (defence in depth).
- **No client policies on `storage.objects`** for the bucket → direct client
  read/write denied; access is via **server-minted signed URLs** (service role).
- Path strategy is **server-generated** (`{class_id}/{child_id}/{submission_id}`);
  the client never chooses the path. Signed-URL read/upload, MIME/size limits, and
  orphan-cleanup are documented.
- Object-level read/upload **policies are placeholders** (commented example in
  `008`) → must be completed in **Phase 7**, after the path parser + grant
  mechanism (H1/H2) are decided. They deny by default until then. ✅

## 7. Env safety summary

`.env.example`: client-safe vars (`NEXT_PUBLIC_*`) vs the **server-only**
`SUPABASE_SERVICE_ROLE_KEY` are clearly separated, with an explicit
"never expose to client / bypasses RLS" warning. **No real secret values** are
committed (all placeholders empty). ✅

---

## Whether Phase 1b can start

**Yes — Phase 1b (data-access seam, still localStorage-backed) can start now.** The
Phase 1a foundation is sound and safe. Track **H1** and **H2** to be resolved when
the **child/device grant path** and the **auth/RPC layer** are actually built
(Phase 1b/5/7), and fold **M1/M2** into the relevant RPCs. None of these block the
seam scaffolding, which doesn't touch the grant path yet.
