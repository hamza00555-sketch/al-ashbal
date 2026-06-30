# Supabase Backend Architecture Plan

> **Planning only.** No Supabase setup, no packages, no migrations, no app/logic/UI
> changes were made in this task. This is the architecture to move الأشبال from a
> one-device localStorage demo to a real shared backend MVP.
>
> Branch: `claude/pensive-hypatia-k6qnf3` · planned at HEAD `c980dab`.
>
> Supporting docs: [`SUPABASE_SCHEMA_DRAFT.md`](./SUPABASE_SCHEMA_DRAFT.md) (§4),
> [`SUPABASE_RLS_POLICY_DRAFT.md`](./SUPABASE_RLS_POLICY_DRAFT.md) (§7),
> [`BACKEND_MIGRATION_PHASES.md`](./BACKEND_MIGRATION_PHASES.md) (§10).

**Backend choice:** Supabase (Auth + Postgres + Row Level Security + Storage). No
serious blocker found — it fits an invitation-first, role-scoped, file-storing MVP
and keeps everything (auth, data, RLS, files) in one platform.

**Preserved product model:** invitation-first onboarding; teacher generates
family/student invitations; family = parent + multiple children; student =
single child; **no halaqa-code onboarding; no multi-class UI in MVP**; one family
device holds multiple children; active child drives the child experience;
submissions stored under the correct child; parents see only linked children;
teachers see only their class students; recordings are private.

---

## Red-team corrections applied (`SUPABASE_BACKEND_ARCHITECTURE_RED_TEAM_REVIEW.md`)

This revision folds in the red-team's required corrections. The plan was
"NEEDS REVISION"; after these, Phase 1a is safe to start.

- **C1 — `child_device_grants` added.** The child/device path is now authorized by
  a real server-side grant (token hash stored in `child_device_grants`, validated
  by `has_child_grant(child_id)` / `can_access_child(child_id)`), **never by a
  client-supplied `child_id`/`activeChildId`**. (§2, schema, RLS.)
- **C2 — submission uniqueness fixed.** `submissions` is **`UNIQUE(child_id,
  assignment_id)`** (+ `source_type`/`source_id`), so siblings can't overwrite each
  other (the demo's global `taskId` keying is dropped). `parent_approvals`,
  `teacher_reviews`, and `points_ledger` all reference `submissions.id`. (§5/§8,
  schema, RLS.)
- **C3 — code hardening added.** Server-generated codes with real entropy; rate
  limiting on validate/register/activate/link RPCs; create-RPC retry on collision;
  validate+consume in one transaction with the counter guard; child-access (TLB)
  and parent-link (WLD) codes expire and can be regenerated. (§5, schema, RLS.)
- **C4 — recording upload flow hardened.** Server-generated path only; authorize
  child + assignment before upload; ordered intent → `uploading` row → signed
  upload URL → finalize → ready, with orphan cleanup; private bucket + signed URLs
  only. (§6/§8.)
- **C5 — Phase 1 split** into **1a (schema + RLS, zero app change)** and **1b (data
  access seam)**; the explicit first task is defined. (`BACKEND_MIGRATION_PHASES.md`.)

---

## 1. Current localStorage audit → backend mapping

Each current store, its purpose, and where it goes. "Local" = stays on device.

| Concept (localStorage key / store) | Current purpose | Move to Supabase? | Stays local? | Target |
|---|---|---|---|---|
| Teacher session (`alashbal:demo-active-teacher-session`, `teacherSession.ts`) | Local demo teacher gate (seeded codes) | **Yes** | Auth cookie only | Supabase Auth + `profiles`/`teacher_profiles` |
| Demo role/session (`alashbal:demo-session`, demoSession) | Demo role override (no real auth) | **Replace** | — | Supabase Auth session |
| Invitations (`alashbal:demo-invitations`, `invitations.ts`) | Teacher invitations + portable payload | **Yes** | — | `invitations` (+ RPCs) |
| Created children (`alashbal:demo-created-children`, `createdChildren.ts`) | Child profiles | **Yes** | — | `children` (+ `class_students`) |
| Child display overrides (`alashbal:child-overrides`, `childProfiles.ts`) | Edited name/avatar | **Yes** | — | columns on `children` |
| Parent-child links (`alashbal:demo-parent-child-links`, `onboarding.ts`) | Parent↔child relationship | **Yes** | — | `parent_child_links` |
| Child link codes (`alashbal:demo-child-link-codes`, `onboarding.ts`) | TLB child-access + WLD parent-link codes | **Yes** | — | `child_access_codes`, `parent_link_codes` |
| Device child ids (`alashbal:demo-device-child-ids`, `deviceChildren.ts`) | Which children are on THIS device | Partly | **Yes (local)** | local list of *granted* child ids (server authorizes each) |
| Active child id (`alashbal:demo-active-child`) | Which child is active now | No | **Yes (local)** | localStorage only |
| Learning materials (`alashbal:materials`) | Teacher materials | **Yes** | — | `learning_materials` |
| Material lessons (`alashbal:material-lessons`) | Lessons under materials | **Yes** | — | `lessons` |
| Lesson prep / today (`alashbal:lesson-prep`) | Teacher daily prep | **Yes** | — | `daily_prep` |
| Assignments (`alashbal:student-assignments`) | Student tasks | **Yes** | — | `assignments` |
| Submissions (`alashbal:submissions`) | Recitation workflow records | **Yes** | — | `submissions` |
| Recordings blob (IndexedDB `alashbal/recordings`) | Audio/video blobs | **Yes** | — | **Storage bucket `recordings`** (path on `submissions`) |
| Reviews (`alashbal:reviews`, `workflow.ts`) | Teacher review state | **Yes** | — | `teacher_reviews` (+ `submissions.state`) |
| Parent approvals (implicit in submissions state) | Parent decision | **Yes** | — | `parent_approvals` (+ `submissions.state`) |
| Points (`alashbal:points`) | Points entries | **Yes** | — | `points_ledger` |
| Progress (`progress.ts`, derived) | Per-material progress | Derived | — | VIEW over `points_ledger`/`learning_materials` (or `child_progress`) |
| Attendance (`alashbal:attendance-*`) | Attendance + gate | **Yes** | — | `attendance_records` (+ optional `attendance_sessions`) |
| Notifications (`alashbal:notifications`) | In-app notifications | Later | Maybe local first | `notifications` (post-MVP) |
| Activities / answers (`alashbal:activities*`) | Class activities | Later | Maybe local first | `activities`/`activity_answers` (post-MVP) |
| **Halaqa enrollment/invite (`alashbal:demo-halaqa-*`, `halaqaEnrollment.ts`)** | **Legacy halaqa-code (deprecated)** | **No — drop** | — | replaced by `class_students` (never surface a code) |

**Key calls:** `activeChildId` and the device's *granted* child-id list remain
local; **everything that is real data moves to Supabase**; the legacy halaqa-code
store is removed (no `halaqa_code` anywhere, no class selector UI).

---

## 2. Auth strategy (MVP)

- **Teacher** — real Supabase Auth user, `profiles.role='teacher'` + `teacher_profiles`.
  Belongs to a class via `class_teachers`. Can create/revoke invitations, manage
  their class roster, author materials/lessons/assignments, review submissions.
- **Parent** — real Supabase Auth user, `profiles.role='parent'` + `parent_profiles`.
  Created during family registration (or signs in later). Sees only linked
  children; approves/sends-back their children's submissions; can link a
  self-registered student by its WLD code.
- **Child** — **Recommendation: Option A — NOT a full auth user in MVP** (kept as a
  profile), made safe by the concrete **`child_device_grants`** primitive (C1).
  - Children are `children` rows linked to a parent (`parent_child_links`) and a
    class (`class_students`).
  - A device opens a child by redeeming the **child access code (TLB)** →
    `activate_child_on_device(code)` server action validates the code (active, not
    expired/revoked, rate-limited) and **inserts a `child_device_grants` row**
    storing only `grant_token_hash`. It returns the **raw grant token** to the
    device, which keeps it (+ `activeChildId`) in localStorage.
  - **Access is enforced server-side by the grant, not the client.** Every
    child-scoped read/write checks `can_access_child(child_id)` =
    `is_linked_parent` OR `is_childs_class_teacher` OR **`has_child_grant`** (which
    hashes the request's grant token and matches it to that child, unexpired,
    unrevoked). A client-supplied `child_id` or `activeChildId` **never**
    authorizes anything on its own.
  - **Why A:** young children don't manage credentials; the family-device model is
    the product; fewer auth users to manage; matches the approved UX.
  - **Risks & mitigations:** the grant is a bearer capability → store only its hash
    server-side, keep it short-lived + slidable, scoped to ONE child, revocable by
    the parent/teacher (revoke the grant and/or rotate the child's TLB code); codes
    expire and can be regenerated; rate-limit activation. See
    `SUPABASE_SCHEMA_DRAFT.md` (`child_device_grants`, `child_access_codes`) and the
    `has_child_grant` predicate in `SUPABASE_RLS_POLICY_DRAFT.md`.
  - **Future upgrade path (Option B):** when older students need cross-device
    self-login, promote `children` to optional auth users (add `children.user_id`)
    and add a child role + policies — without changing the parent/teacher model.

---

## 3. Roles & permissions matrix

`A` = allowed, `D` = denied. "Server" = via server action / `SECURITY DEFINER`
RPC using validated context (not a raw client write).

| Action | Anonymous | Teacher | Parent | Child/device session | Service role (server) |
|---|---|---|---|---|---|
| create invitation | D (no auth) | A — own class only | D | D | A |
| use invitation (register) | A — via RPC only, validated code | D | A (already a parent) | D | A |
| create parent | A — via family-register RPC | D | D | D | A |
| create child | Server (during register) | A — for own class | A — own family (register/add) | D | A |
| read child | D | A — own class students | A — linked only | A — active granted child only | A |
| update child (name/avatar) | D | A — own class | A — linked only | D (parent does it) | A |
| link parent-child | Server (register) | D | A — via WLD code RPC | D | A |
| read teacher roster | D | A — own class | D | D | A |
| read attendance | D | A — own class | A — linked child rows | D | A |
| create material | D | A — own class | D | D | A |
| create lesson | D | A — own class | D | D | A |
| create assignment | D | A — own class | D | D | A |
| submit recording (row) | D | D | A — for linked child | A — for active granted child (via server) | A |
| upload recording file | D | D | A — to own child's path | A — to active child's path (signed) | A |
| approve submission (parent) | D | D | A — linked child only | D | A |
| review submission (teacher) | D | A — class teacher only | D | D | A |
| read points/progress | D | A — own class | A — linked only | A — active child only | A |
| revoke invitation | D | A — creator only | D | D | A |

Reasons (short): anon has no `auth.uid()` so all `is_*` checks fail → only narrow
RPCs are reachable; teachers are scoped by `class_teachers`; parents by
`parent_child_links`; child/device by a scoped grant; service role bypasses RLS and
runs only on the server.

---

## 4. Database schema → see [`SUPABASE_SCHEMA_DRAFT.md`](./SUPABASE_SCHEMA_DRAFT.md)

Normalized, multi-class-capable, RLS-on-everything. Tables: `profiles`,
`teacher_profiles`, `parent_profiles`, `classes`, `class_teachers`, `children`,
`class_students`, `parent_child_links`, `invitations`, `invitation_uses`,
`child_access_codes`, `parent_link_codes`, **`child_device_grants` (C1)**,
`learning_materials`, `lessons`, `daily_prep`, `assignments`, `submissions`,
`parent_approvals`, `teacher_reviews`, `points_ledger`, `child_progress` (or view),
`attendance_records`, `audit_events`. **`submissions` is UNIQUE per
`(child_id, assignment_id)` (C2).**

---

## 5. Invitation model (backend)

Fields on `invitations`: `type`, `code`, `label`, `class_id`,
`created_by_teacher_id`, `max_children`, `max_parents`, `used_children_count`,
`used_parents_count`, `expires_at`, `revoked_at`, `used_at`. Status is derived
(`revoked_at` → revoked; `expires_at < now()` → expired; else active).

- **Family uses invitation:** `register_family_from_invitation(code, parentInput, childrenInput[])`
  runs server-side in one transaction: validate (active, not expired/revoked,
  `len(children) <= max_children - used_children_count`); create/sign-in the parent
  auth user + `parent_profiles`; insert each `children` row + `class_students` +
  `parent_child_links` + a `child_access_codes` row; write `invitation_uses`;
  increment `used_children_count` (+ `used_parents_count`); return child access codes.
- **Student uses invitation:** `register_student_from_invitation(code, studentInput)`
  validates (single-use: `max_children=1`, `used_children_count=0`), creates one
  `children` row + `class_students`, a `parent_link_codes` (WLD) row, sets
  `used_children_count=1` and `used_at=now()`, returns the parent-link code +
  a device child grant.
- **Prevent student reuse:** the single-use check is server-side and atomic
  (`update … set used_children_count = used_children_count + 1 where id = … and
  used_children_count < max_children returning …`); a second attempt affects 0 rows
  → rejected ("تم استخدام هذه الدعوة").
- **Prevent exceeding family child limit:** same atomic guard on
  `used_children_count + len(children) <= max_children` inside the transaction.
- **Server-side only:** validation, all counters, all inserts, code generation.
  The client never writes `used_*_count` and never reads the whole invitations
  table. `validate_invitation(code)` returns only public-safe fields for the join
  screen.
- **C3 — code hardening (required guardrails):**
  - **Server-generated codes with sufficient entropy** (lengthen beyond the demo's
    4 random chars; keep the FAM-/STD- prefix). **Never trust a client-supplied
    code** as anything but a lookup key.
  - **Rate-limit** `validate_invitation`, `register_*`, `activate_child_on_device`,
    and `link_parent_to_child_by_code` at the server-action / RPC layer (per IP +
    per code) to stop enumeration/brute force.
  - **Create-RPC retries on unique-violation** (regenerate the code) so a rare
    collision never surfaces to the teacher.
  - **Validate + consume in ONE transaction/RPC**: lock the invitation row
    (`SELECT … FOR UPDATE` or the conditional `UPDATE … WHERE used+N ≤ max
    RETURNING`) and do the child inserts in the same transaction — so two
    concurrent uses of the same invitation can't both pass the limit (no race).
  - **Child-access (TLB) and parent-link (WLD) codes expire and can be
    regenerated** (rotation revokes the old code). Redeeming a TLB code mints a
    `child_device_grant`; it does not grant access by itself.

---

## 6. Storage plan for recordings

- **Bucket:** `recordings` — **private** (not public).
- **Path strategy:** **server-generated only** —
  `recordings/{class_id}/{child_id}/{submission_id}.{ext}` (or a random object id)
  stored as `submissions.recording_path`. The **client never chooses the path**
  (otherwise it could target another child's folder); the server derives it from
  the authorized `child_id` + the new `submission_id`.
- **Metadata:** the `submissions` row holds `recording_path`, `recording_type`,
  `duration_seconds`, `child_id`, `assignment_id`, `class_id`, `teacher_id`, state.
  The file name carries no PII.
- **C4 — safe MVP upload flow (row ↔ file kept in sync):**
  1. Client calls `requestUploadIntent({childId, assignmentId, mime, size})`.
  2. Server validates `can_access_child(childId)` (parent or device grant), the
     assignment, MIME allow-list, and size; enforces `UNIQUE(child_id, assignment_id)`.
  3. Server inserts a `submissions` row `state='uploading'` with the
     server-generated `recording_path`.
  4. Server returns a **short-lived signed upload URL** scoped to that path only.
  5. Client uploads the file to that URL.
  6. Client calls `finalizeSubmission({submissionId})`.
  7. Server verifies the object exists at the path, then sets
     `state='pending_parent'` (or `pending_teacher` if the child has no linked
     parent). On failure/timeout, a reconciliation job deletes `uploading` rows +
     their objects older than N minutes (no orphans either way).
- **Read/download:** **no public URLs.** Playback uses short-lived **signed
  download URLs** minted server-side after the same `can_access_child` /
  `teacher_id` check against the submission. Anon / unrelated users → denied.
- **Storage policies:** mirror the table RLS — authorize against the `submissions`
  row resolved from the path using `can_access_child(child_id)` / `teacher_id`.
- **Deletion:** no client delete; only the retention/reconciliation job or an admin.
- **Production concerns (note for later):** enforce max file size (e.g. ≤ 25–50 MB)
  and an allowed MIME allow-list (audio/webm, audio/mp4, video/webm, video/mp4);
  add malware/content scanning before exposing teacher playback at scale; define a
  retention/auto-deletion policy (e.g. delete blobs N days after acceptance, or on
  child deletion) and parental-consent handling.

---

## 7. RLS policies → see [`SUPABASE_RLS_POLICY_DRAFT.md`](./SUPABASE_RLS_POLICY_DRAFT.md)

RLS enabled on all tables; deny-by-default; per-table SELECT/INSERT/UPDATE/DELETE
drafts; business-rule writes via `SECURITY DEFINER` RPCs; service role server-only.

---

## 8. Server actions / RPC plan (minimum backend operations)

For each: caller · inputs · validation · authz · tables touched · output · failures.

1. **createTeacherInvitation** — Teacher · `{type,label,maxChildren,maxParents,expiresDays}`
   · type∈{family,student}, limits in range · `is_class_teacher(class_id)` ·
   `invitations` · `{code, link}` · fail: not teacher, bad input.
2. **revokeInvitation** — Teacher · `{invitationId}` · exists · creator only ·
   `invitations.revoked_at` · `ok` · fail: not creator/not found.
3. **validateInvitation** — Anon · `{code}` · normalize · none (public-safe fields) ·
   reads ONE `invitations` row via RPC · `{type,label,maxChildren,status}` · fail:
   invalid/expired/revoked Arabic error.
4. **registerFamilyFromInvitation** — Anon→Parent · `{code,parent,children[]}` ·
   active + `len(children) ≤ remaining` · atomic counter guard · `profiles`,
   `parent_profiles`, `children`, `class_students`, `parent_child_links`,
   `child_access_codes`, `invitation_uses`, `invitations` · `{parentSession,
   childAccessCodes[]}` · fail: limit exceeded, expired/revoked.
5. **registerStudentFromInvitation** — Anon · `{code,student}` · single-use atomic ·
   `children`, `class_students`, `parent_link_codes`, `invitation_uses`,
   `invitations` · `{parentLinkCode, childGrant}` · fail: already used.
6. **createChildAccessCode** — Parent/Server · `{childId}` · `is_linked_parent` ·
   `child_access_codes` · `{code}` · fail: not linked.
7. **activateChildOnDevice** — Anon/device · `{code}` · code active (not
   expired/revoked), rate-limited · capability · reads `child_access_codes` →
   **inserts `child_device_grants` (stores `grant_token_hash`)** · `{rawGrantToken,
   childId}` · fail: bad code "كود الدخول غير صحيح". The device keeps the raw token
   locally and sends it on each child request (C1).
8. **linkParentToChildByCode** — Parent · `{code}` · WLD valid + not consumed ·
   `parent_id=auth.uid()` · `parent_child_links`, `parent_link_codes` · `{childId}`
   · fail: invalid/duplicate ("مسبقًا").
9. **createAssignment** — Teacher · `{classId,…}` · `is_class_teacher` ·
   `assignments` · `{assignment}` · fail: not teacher.
10a. **requestUploadIntent** — Parent/device · `{childId,assignmentId,mime,size}` ·
    `can_access_child(childId)`, MIME+size ok, `UNIQUE(child_id,assignment_id)` ·
    inserts `submissions(state='uploading')` with server-generated path · returns
    `{submissionId, signedUploadUrl}` · fail: unauthorized, dup, bad file (C2/C4).
10b. **finalizeSubmission** — Parent/device · `{submissionId}` ·
    `can_access_child(child)` + object exists at path · `submissions.state`→
    `pending_parent` (or `pending_teacher` if no linked parent) · `ok` · fail:
    object missing → leave `uploading` for cleanup (C4).
11. **approveSubmissionAsParent** — Parent · `{submissionId,decision}` ·
    `is_linked_parent(child)` (resolved from the submission id) · `submissions.state`,
    `parent_approvals` (references `submission_id`) · `ok` · fail: not linked / bad
    transition.
12. **reviewSubmissionAsTeacher** — Teacher · `{submissionId,decision,points}` ·
    `is_childs_class_teacher(child)` (from the submission id) · `submissions.state`,
    `teacher_reviews` (references `submission_id`), `points_ledger`
    (`source_type='submission'`, `source_id=submission_id`) · `ok` · fail: not class teacher.
13. **getTeacherRoster** — Teacher · `{}` · `is_class_teacher` · reads `class_students`
    ⨝ `children` · `[children]` · fail: not teacher.
14. **getParentChildren** — Parent · `{}` · `parent_id=auth.uid()` · `parent_child_links`
    ⨝ `children` · `[children]` · —.
15. **getChildDashboard** — Parent/device · `{childId}` · `can_access_child(childId)`
    (parent link OR device grant — never the bare client id) · reads
    tasks/submissions/points scoped to child · `{dashboard}` · fail: unauthorized.

Most reads can be plain RLS-protected `select`s from the client; the **writes that
enforce business rules** (4, 5, 7, 8, 10, 11, 12) should be server actions / RPCs.

---

## 9. Environment variables

| Var | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **public / client-safe** | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **public / client-safe** | anon key (RLS-bound) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only secret** | **NEVER expose to client**; server actions / Edge Functions only |
| `SUPABASE_STORAGE_BUCKET_RECORDINGS` | server (or public name) | e.g. `recordings` |
| `NEXT_PUBLIC_APP_URL` / `APP_BASE_URL` | public | for building `/join` links + auth redirects |
| `SUPABASE_JWT_SECRET` (if minting child grants) | **server-only secret** | only if using custom signed grants |

Rule: anything prefixed `NEXT_PUBLIC_` ships to the browser — keep the service role
key (and any signing secret) un-prefixed and used strictly server-side.

---

## 10. Migration plan → see [`BACKEND_MIGRATION_PHASES.md`](./BACKEND_MIGRATION_PHASES.md)

Phases behind a data-access seam + `NEXT_PUBLIC_BACKEND` flag: **(1a) infra +
schema + RLS (zero app change), (1b) data-access seam**, (2) teacher auth,
(3) invitations+/join, (4) family/parent/children, (5) child switcher on backend +
**child device grants** (activeChildId stays local), (6) materials/tasks,
(7) recordings to Storage + submissions, (8) points/progress/attendance. Each
phase has QA + rollback. (C5 splits the old Phase 1.)

---

## 11. Security risks & blockers

**Risks in the current demo (all expected for a closed demo, blockers for public):**
- localStorage demo is **not secure** — anyone can read/edit their browser state.
- the portable `demoInvite` payload is **plaintext/unsigned** — forgeable.
- the teacher local access code is **not real auth** — codes are in the bundle.
- audio/video recordings are **sensitive children's data** — must be private + access-controlled.
- children's data needs **careful authorization** (parent-link / class-teacher only).

**Backend risks to design against:**
- **Service role key must never reach the client** — server-only.
- **RLS must be enabled on every exposed table** (deny-by-default; verify with advisors).
- **Anonymous invitation use must be tightly controlled** — only narrow RPCs, no
  table browsing, rate-limited; never expose all codes.
- **Direct client writes must be limited** where business rules matter (invitation
  counters, registration, approvals, points) → server actions/RPCs only.
- **Child-access grants are bearer capabilities** — short-lived, scoped, revocable.
- **Storage** must be private with signed, authorized URLs (no public bucket).

**Blockers before any public launch:** real auth + server-side route protection;
backend invitation/registration with authorization; RLS verified on all tables;
private Storage with signed access; removal of hard-coded codes and the
`demoInvite` payload; a privacy/consent + retention policy for children's recordings.

---

## 12. Implementation recommendation (opinionated)

**Do first (in order):** **Phase 1a** (Supabase project + clients + env + the first
schema/RLS migration — including `child_device_grants` (C1) and the
`submissions UNIQUE(child_id, assignment_id)` (C2) — RLS on every table, helper
functions, RPC stubs; **no app/UI change**) → **Phase 1b** (data-access seam) →
Phase 2 (real teacher auth + server-side route protection) → Phase 3 (backend
invitations + `/join`). These remove the three biggest "not real" pieces (local
teacher gate, client-only invitations, forgeable payload) and give a true
cross-device demo.

**Move to backend first:** auth (teacher, then parent), invitations, and
parent/children/links — because they are the trust boundary and the cross-device
value. Recordings + submissions (Phase 7) are the next priority since they're the
most sensitive data.

**Keep local:** `activeChildId` and the device's *granted* child-id list, plus pure
UI preferences. The active-child choice is a device concern; the server still
authorizes every child read/write — never trust the client's active id alone.

**Avoid:** adding any new localStorage feature; building multi-class / halaqa-code
UI; promoting children to auth users in the MVP; exposing the service role key; raw
client writes to counters/approvals/points; any public Storage bucket.

**Net:** a small, staged path — schema-first, then auth, then invitations, then
data — converts the approved demo into a secure shared MVP without redesigning the
product or breaking the closed-demo flows.
