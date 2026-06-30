# Backend Migration Phases (Section 10)

> Planning only. Staged migration from the localStorage demo to a Supabase MVP.
> Each phase is independently shippable, keeps the app working, and has a QA
> checklist + rollback. Golden rule: **never break the closed-demo flows** while
> migrating; migrate one store at a time behind a thin data-access seam.

**Enabling pattern (do this in Phase 1):** introduce a small data-access layer
(e.g. `src/lib/data/*` adapters) so pages call `getTeacherRoster()` etc. rather
than localStorage directly. Then each phase swaps one adapter from localStorage
to Supabase with no page changes. A feature flag (`NEXT_PUBLIC_BACKEND=supabase|local`)
allows per-environment rollback.

---

## Phase 1 — Supabase setup + schema (no behavior change)
- **Changes:** add `@supabase/supabase-js` + `@supabase/ssr`; create browser +
  server clients; add env vars; run schema migrations (all tables, RLS enabled,
  helper functions, RPC stubs). Seed one `classes` row. Add the data-access seam.
- **Must not break:** the entire app still runs on localStorage (flag = local).
- **QA:** build/lint; app behaves exactly as today; `supabase db` migrations apply
  cleanly; RLS on every table verified with the linter/advisors.
- **Rollback:** delete the Supabase project/migrations; remove clients. No app
  logic depended on them yet.

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

## Phase 5 — Child switcher uses backend children (activeChildId stays local)
- **Changes:** `getAvailableChildrenForThisDevice()` resolves from DB
  (parent-linked children + children activated by access code on this device).
  `activate_child_on_device(code)` RPC returns a scoped child-access grant;
  the device stores `activeChildId` + the granted child ids **locally**.
- **Must not break:** `/child/switch` picker, identity strip, single title,
  invalid code → `كود الدخول غير صحيح`, multiple children per device.
- **QA:** activate child by code on a second device → appears in switcher; switching
  changes the active child everywhere; device cannot read children it wasn't granted.
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

## Phase 7 — Recordings to Storage + submissions table
- **Changes:** record → upload the blob to the private `recordings` bucket via a
  signed upload (server action `submit_recording`), write a `submissions` row with
  `recording_path`. Playback uses short-lived signed URLs. Parent approval / teacher
  review update the row (`parent_approvals`, `teacher_reviews`).
- **Must not break:** record → "سيتم إرسال التسجيل باسم: X" + confirm → parent
  approval shows the right child → teacher review shows the right child; identity
  integrity (submission stored under the correct child).
- **QA:** submit as نور → stored under نور; only the linked parent + class teacher
  can fetch the file (signed URL); anon/other parents get 403; large/oversized or
  wrong MIME rejected.
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
