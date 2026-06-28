# Closed Demo — Launch Readiness

**Launch type:** Closed Local Demo / MVP Test — **NOT** public production.
**Branch:** `claude/pensive-hypatia-k6qnf3`
**HEAD:** `9cf9d2a` (readiness verified at this commit; this doc is committed on top)
**Date:** 2026-06-28
**Status:** ✅ **READY for closed demo testing.**

This release is a localStorage-only demo meant to be shared with a small, trusted
group for hands-on testing. It is **not** a public, secure, authenticated, or
backend-powered app. See "Not production-safe" below.

---

## What is ready

- **Invitation-first onboarding** — the landing leads with «لدي دعوة» → `/join`;
  teacher login and a clearly-labelled «تجربة محلية» fallback are secondary.
- **Teacher-generated invitations** — family (parent + up to 5 children) and
  single-use student invitations, with code + portable link + WhatsApp copy,
  list with status, copy link, and revoke.
- **Portable demo links** — `/join?code=…&demoInvite=…` rebuilds the invitation
  in a fresh browser/localStorage so links are shareable for the demo.
- **Shared family device child switcher** — one device holds multiple child
  profiles; the active child drives the dashboard/tasks/progress/submissions.
- **Local teacher access gate** — `/teacher/*` requires a local teacher session
  (seeded access codes); `/teacher/login` standalone screen; identity strip +
  logout.
- **Learning flow** — today lesson, child tasks, recording → parent approval →
  teacher review → points, all keyed to the correct active child.
- No halaqa-code onboarding; no multi-halaqa UI.

---

## Must-pass flows (all verified ✅)

1. **Public entry** — `/`, `/join`, `/join?code=…`: invitation-first; code input;
   teacher login + local demo secondary; no halaqa-code; no open-role main path.
2. **Teacher access** — `/teacher` requires login; invalid code → «كود المعلم غير
   صحيح»; `TCH-001` logs in as «المعلم الأول»; dashboard shows identity; logout
   works; all teacher routes require login after logout.
3. **Teacher invitations** — create family + student; copy link (portable) + copy
   WhatsApp (full link); revoke; invalid/expired/revoked errors.
4. **Family invitation flow** — open link in fresh storage → register parent +
   3 children → success with child access codes → children appear in `/parent`,
   `/parent/children`, `/child/switch`, `/teacher/children`, `/teacher/attendance`.
5. **Student invitation flow** — open link in fresh storage → register مازن →
   profile created + on device + active child + parent-link code shown + visible
   to teacher + single-use.
6. **Shared family device** — `/child`, `/child/switch`; active-child identity
   strip (single title); switch عبدالله → نور; invalid child access code →
   «كود الدخول غير صحيح».
7. **Learning regression (active child نور)** — task visible; record → submission
   stored as نور; parent approval shows نور; teacher review shows نور (not a
   sibling); no cross-sibling mixing.

**Route audit (26 routes @ 390px):** no blank pages, no redirect loops, no
console/page errors, no horizontal overflow. Routes covered: `/`, `/join`,
`/join?code=…`, `/child`, `/child/start`, `/child/switch`, `/child/tasks`,
`/child/lessons`, `/child/progress`, `/child/wishes`, `/parent`,
`/parent/children`, `/parent/link-child`, `/parent/approvals`, `/teacher`,
`/teacher/login`, `/teacher/invitations`, `/teacher/children`,
`/teacher/attendance`, `/teacher/reviews`, `/teacher/materials`, `/teacher/prep`,
`/teacher/activities`, `/teacher/halaqa`, `/guest`, `/settings`, `/style-guide`.

**Copy audit:** no `كود الحلقة` / `اختيار حلقة` / `ربط الطفل بالحَلَقة` and no old
open-role onboarding CTAs anywhere. (`الحلقات` appears only in a teacher-internal
activities-reset note and a read-only guest stat — neither is onboarding.) The
approved wording is used: كود الدعوة، دعوة عائلة، دعوة طالب، كود دخول الطفل،
كود ربط ولي الأمر، دخول المعلم.

**Build/lint:** `npm run build` ✅ · `npm run lint` ✅. Closed-demo QA: **62/62**.

---

## Demo teacher codes (QA / demo facilitators only)

Hard-coded in `src/lib/demo/teacherSession.ts`, **not shown** in the UI. Share
only with demo facilitators, not in user-facing materials:

| Code      | Teacher        |
|-----------|----------------|
| `TCH-001` | المعلم الأول   |
| `TCH-002` | المعلم الثاني  |

---

## Known limitations

- **localStorage / IndexedDB only** — all data lives in the user's browser. There
  is no server, no shared database, no sync across devices/browsers.
- **Invitation links are per-browser** — the portable `demoInvite` payload lets a
  link open in a fresh browser, but a manually-typed code with no payload can't
  be resolved (shows a helpful message). Codes don't sync across devices.
- **Recordings** are stored locally (IndexedDB) and never uploaded.
- **Teacher identity** in the page header still shows the seed mock teacher; the
  session identity is shown by the «مسجل كمعلم: …» strip.
- **One parent profile per family** (family `maxParents` stored for the future).

---

## Not production-safe (must be replaced before public launch)

- **No authentication.** The teacher gate is client-side localStorage only and is
  trivially bypassable. Demo teacher codes are hard-coded in the client bundle.
- **No authorization / server-side protection.** Nothing is enforced on a server.
- **`demoInvite` payload is plaintext** (base64url, unsigned) — forgeable; for
  demo portability only.
- **No data integrity / privacy boundary** — anything in a device's storage is
  readable/writable by that device's user.

---

## Security Launch Gate — result summary

Reviewed every API route, server action, and endpoint for missing
authentication/authorization.

**Finding: there are NO server-side endpoints.** `find src/app -name route.ts`
→ none; no `"use server"` actions; the app is 100% client-side (Next.js pages +
localStorage/IndexedDB). Therefore there is no server attack surface to protect —
and, equally, **no server-side protection exists for any data**. All reads/writes
/deletes (children, submissions, points, invitations, teacher session) happen in
the browser with no auth.

Demo-specific notes:
- **Teacher-only client routes** (`/teacher/*`) are gated ONLY client-side
  (`TeacherShellGate` reads `alashbal:demo-active-teacher-session`). Bypassable by
  editing localStorage or reading the bundle. Not a security boundary.
- **Demo codes in client code** — `TCH-001` / `TCH-002` are visible to anyone who
  inspects the JavaScript bundle.
- **Portable invitation payload** — `demoInvite` is decodable/forgeable by anyone
  with the link; it carries no secrets and is unsigned.

**Must be replaced before public production:**
- Real backend with authenticated sessions (cookies/tokens) and server-side route
  protection for every teacher/parent/child data path.
- Server-side invitation lookup (replace the `demoInvite` URL payload) with
  authorization on accept/use.
- Server-side authorization on all reads/writes/deletes (submissions, points,
  rosters, profiles), enforcing parent↔child and teacher↔class relationships.
- Remove hard-coded teacher codes; issue real teacher accounts.

No launch-blocker fixes were required for the **closed demo**; the above are
required before any **public** launch.

---

## Closed demo instructions

1. Host the build (e.g. `npm run build && npm run start`) and share the base URL
   with the trusted test group.
2. **Facilitator (teacher):** open the base URL → «دخول المعلم» → enter `TCH-001`
   → `/teacher/invitations` → create a family or student invitation → **Copy link**
   or **Copy WhatsApp message** and send it to a tester.
3. **Tester (family):** open the link → register the parent and children → keep
   the shown child access codes → use `/child/switch` to pick a child and try the
   tasks/recording.
4. Each browser/device is independent (localStorage). To reset, clear site data.
5. Do not use real personal data — this is a local demo.

---

## Recommended next step after the closed demo

Stand up the backend + authentication layer (the "Security Launch Gate" items
above): real teacher/parent accounts, server-side invitation records, and
authorization on every data path. That replaces the localStorage demo stores and
the client-only gates with a production-safe foundation before any public launch.
