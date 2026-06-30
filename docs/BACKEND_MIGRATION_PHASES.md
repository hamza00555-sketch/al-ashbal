# Backend Migration Phases (Section 10)

> Planning only. Staged migration from the localStorage demo to a Supabase MVP.
> Each phase is independently shippable, keeps the app working, and has a QA
> checklist + rollback. Golden rule: **never break the closed-demo flows** while
> migrating; migrate one store at a time behind a thin data-access seam.

**Enabling pattern (introduced in Phase 1b, not 1a):** a small data-access layer
(e.g. `src/lib/data/*` adapters) so pages call `getTeacherRoster()` etc. rather
than localStorage directly. Then each later phase swaps one adapter from
localStorage to Supabase with no page changes. A feature flag
(`NEXT_PUBLIC_BACKEND=supabase|local`) allows per-environment rollback.

> **C5 — Phase 1 is split.** The original "Phase 1" bundled *schema* with the
> *data-access seam*. The seam touches every page (a real refactor), so it is NOT
> "no behavior change." Phase **1a** is pure infra/schema (zero app change);
> Phase **1b** is the seam refactor.

---

## Phase 1a — Schema + RLS foundation only (zero app/UI change)
- **Changes:** create the Supabase project; add `@supabase/supabase-js` +
  `@supabase/ssr`; create browser + server client utilities + env vars; run the
  **first schema migration: ALL tables** (including **`child_device_grants` (C1)**
  and **`submissions UNIQUE(child_id, assignment_id)` (C2)**), **RLS enabled on
  every table**, helper functions (`is_class_teacher`, `is_linked_parent`,
  `is_childs_class_teacher`, `has_child_grant`, `can_access_child`), and empty
  `SECURITY DEFINER` RPC stubs; create the **private `recordings` Storage bucket**.
  Seed one `classes` row. **No page/UI changes, no data migration, no behavior
  switch.**
- **Must not break:** anything — the app still runs 100% on localStorage; no page
  imports Supabase yet.
- **QA:** build/lint unchanged; closed-demo QA still 62/62; migrations apply
  cleanly; **Supabase advisors confirm RLS is ON for every table**; the bucket is
  private.
- **Rollback:** delete the project/migrations; remove the client utilities + env.
  Nothing in the app depended on them.

> **▶ FIRST IMPLEMENTABLE TASK = Phase 1a.** Create the Supabase project, add the
> client/server utilities + env vars, and write the first migration: all tables
> (with `child_device_grants` C1 and `submissions UNIQUE(child_id, assignment_id)`
> C2), RLS enabled on every table, the helper functions, RPC stubs, and the private
> `recordings` bucket. Seed one `classes` row. Touch **no** pages/UI. Verify with
> Supabase advisors that RLS is on for every table. This is safe to start now.

## Phase 1b — Data-access seam scaffolding (no behavior switch)
- **Changes:** introduce typed Supabase client/server utilities and the
  `src/lib/data/*` adapter seam + server-action / RPC wrappers, behind
  `NEXT_PUBLIC_BACKEND`. Pages call the seam; the seam still reads/writes
  **localStorage** while `flag=local`. No user-facing behavior change yet.
- **Must not break:** every current flow (route audit + must-pass flows) — the seam
  is a pass-through to the existing localStorage stores.
- **QA:** build/lint; closed-demo QA still 62/62 with `flag=local`; no page reads
  localStorage directly anymore (all via the seam).
- **Rollback:** revert the seam (pages call the stores directly) — it is additive.

## Phase 2 — Real teacher auth + profile
- **Changes:** replace the local teacher gate with Supabase Auth (email/password
  or magic link). `/teacher/login` → real sign-in; `TeacherShellGate` checks the
  Supabase session (server-side via middleware/`getUser`). Create `profiles` +
  `teacher_profiles` on first login. Seed the demo teacher as a real user.
- **Must not break:** teacher dashboard, identity strip, logout; child/parent/join
  flows (still local this phase).
- **QA:** logged-out `/teacher/*` → login; valid creds → dashboard; logout clears
  the real session; protected routes enforced **server-side** (middleware), not
  just client.
- **Rollback:** flag back to the local teacher code gate.

## Phase 3 — Backend invitations + /join
- **Changes:** `invitations` table + RPCs (`create_invitation`, `revoke_invitation`,
  `validate_invitation`). `/teacher/invitations` writes to DB; `/join` validates
  via the RPC. Replace the portable `demoInvite` payload with a real code lookup
  (the link becomes `/join?code=FAM-…` only). `created_by_teacher_id` = the auth
  teacher; `class_id` = the teacher's class.
- **Must not break:** create/copy/revoke UI; family/student gating by type; error
  copy (`كود الدعوة غير صحيح` / expired / revoked); cross-device link (now real).
- **QA:** create invite on teacher device → open code on a different device →
  resolves; revoke → blocked; expired → blocked; student single-use enforced
  server-side.
- **Rollback:** flag to local invitations + portable payload.

## Phase 4 — Family registration + parent/children in DB
- **Changes:** `register_family_from_invitation` and `register_student_from_invitation`
  RPCs (transactional): create parent auth user (family) / child rows,
  `parent_child_links`, `class_students`, `child_access_codes` / `parent_link_codes`,
  increment `used_*_count`. `/parent`, `/parent/children`, `/parent/link-child`
  read from DB.
- **Must not break:** family success screen + child access codes; parent sees only
  linked children; student parent-link code; "register student first, link parent
  later" path.
- **QA:** family of 3 from a fresh device → parent + 3 children in DB, all linked;
  child limit enforced; parent of family A cannot see family B's children (RLS).
- **Rollback:** flag to local onboarding stores.

## Phase 5 — Child switcher on backend + child device grants (C1; activeChildId stays local)
- **Changes:** introduce **`child_device_grants` (C1)**. `activate_child_on_device(code)`
  validates the TLB code and **mints a grant** (stores `grant_token_hash`, returns
  the raw token to the device). `getAvailableChildrenForThisDevice()` resolves from
  DB = parent-linked children + children the device holds a valid grant for. The
  device stores `activeChildId` + raw grant tokens **locally**; every child read
  sends the grant token and the server checks `has_child_grant` — the client
  `activeChildId` is never the authorization.
- **Must not break:** `/child/switch` picker, identity strip, single title,
  invalid code → `كود الدخول غير صحيح`, multiple children per device.
- **QA:** activate child by code on a second device → appears in switcher; switching
  changes the active child everywhere; **a device with a grant for child A cannot
  read child B** (forge `activeChildId`/`child_id` → denied by `has_child_grant`);
  revoking the grant/rotating the code cuts access.
- **Rollback:** flag to local device-children store.

## Phase 6 — Learning materials/tasks to backend
- **Changes:** `learning_materials`, `lessons`, `daily_prep`, `assignments` move to
  DB. Teacher authoring pages write to DB; child tasks/lessons read from DB (scoped
  to the child's class).
- **Must not break:** `/teacher/materials`, `/teacher/prep`, `/child/tasks`,
  `/child/lessons`; today-lesson display; assignment → recordable task mapping.
- **QA:** teacher creates an assignment → appears for that class's children only;
  no cross-class leakage.
- **Rollback:** flag to local content stores.

## Phase 7 — Recordings to Storage + submissions table (C2 + C4)
- **Changes:** the **C4 ordered flow** — `requestUploadIntent` (authorize child +
  assignment, MIME/size, server-generated path, insert `submissions` `state='uploading'`,
  enforce **`UNIQUE(child_id, assignment_id)` (C2)**) → signed upload URL → client
  uploads → `finalizeSubmission` (verify object → `pending_parent`, or
  `pending_teacher` if no linked parent). Playback uses short-lived signed URLs.
  Parent approval / teacher review update the row (`parent_approvals`,
  `teacher_reviews`, both referencing `submission_id`). Orphan-cleanup job for stale
  `uploading` rows.
- **Must not break:** record → "سيتم إرسال التسجيل باسم: X" + confirm → parent
  approval shows the right child → teacher review shows the right child; identity
  integrity (submission stored under the correct child).
- **QA:** submit as نور → stored under نور; **two siblings submitting the same
  assignment do NOT overwrite each other (C2)**; only the linked parent + class
  teacher can fetch the file (signed URL); anon/other parents get 403; a
  client-chosen path is rejected; large/oversized or wrong MIME rejected; a failed
  upload leaves no orphan (cleanup).
- **Rollback:** flag to IndexedDB + local submissions (demo only).

## Phase 8 — Points/progress/attendance to backend
- **Changes:** `points_ledger` (append-only) written on review acceptance; progress
  as a VIEW; `attendance_records` written by the teacher.
- **Must not break:** points increase for the correct child only; progress doesn't
  mix siblings; attendance roster.
- **QA:** accept نور's submission → points to نور only; parent sees progress for
  linked children only; teacher sees class attendance only.
- **Rollback:** flag to local points/progress/attendance.

---

## After Phase 8 (cleanup, not "more localStorage")
- Remove dead local stores and the legacy `halaqaEnrollment` (`alashbal:demo-halaqa-*`).
- Keep ONLY `activeChildId` + granted device-child ids + UI prefs in localStorage.
- Run the Security Launch Gate again (now there ARE endpoints to audit) before any
  public launch.
