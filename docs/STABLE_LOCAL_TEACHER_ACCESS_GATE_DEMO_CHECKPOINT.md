# Checkpoint — Local Teacher Access Gate (Demo)

**Tag:** `stable-local-teacher-access-gate-demo`
**Branch:** `claude/pensive-hypatia-k6qnf3`
**Approved feature HEAD:** `db2fb54` — `feat(demo): add local teacher access gate`
**Previous stable checkpoint:** `de1a432` — portable invitations + child switcher polish
**Date:** 2026-06-28

This checkpoint approves the local demo teacher access gate. It is a
documentation/checkpoint commit only — no UI, logic, or feature changes were
made to reach it.

> **This is local demo gating only — NOT real authentication.** It gates the
> demo UI client-side and must be replaced by backend auth + server-side route
> protection before launch.

---

## Summary — local teacher access gate

The `/teacher` area is now gated behind a seeded access code:

- `/teacher/login` is a standalone branded screen (no teacher nav) with a
  teacher-code field (required) and an optional name. A valid code creates a
  local teacher session and opens `/teacher`. An invalid code shows
  «كود المعلم غير صحيح» and creates no session.
- `TeacherShellGate` (in the teacher layout) renders the login standalone, shows
  the AppShell dashboard only when a session exists, and redirects a logged-out
  user off any other `/teacher` route to `/teacher/login`.
- The teacher dashboard shows a calm identity strip «مسجل كمعلم: …» with a
  secondary «تسجيل خروج» that clears the session and returns to the login.
- The landing «دخول المعلم» points to `/teacher/login` (still secondary to the
  invitation-first flow).

---

## Demo teacher codes used for QA

Hard-coded for the local demo (in `src/lib/demo/teacherSession.ts`) and
intentionally **not shown** on the login screen:

| Code      | teacherId     | displayName   |
|-----------|---------------|---------------|
| `TCH-001` | `teacher-001` | المعلم الأول  |
| `TCH-002` | `teacher-002` | المعلم الثاني |

QA used `TCH-001` (logs in as المعلم الأول) and `BAD-CODE` (rejected).

---

## Teacher session storage

- **Key:** `alashbal:demo-active-teacher-session`
- **Shape:** `{ teacherId, displayName, accessCode, loggedInAt }`
- **Helpers** (`src/lib/demo/teacherSession.ts`): `getActiveTeacherSession`,
  `setActiveTeacherSession`, `clearActiveTeacherSession`, `isTeacherLoggedIn`,
  `findTeacherByCode`, and the reactive `useTeacherSession` hook (snapshot cached
  by signature for a stable `useSyncExternalStore` value).

---

## Protected teacher routes

All of `/teacher/*` require a local teacher session, except `/teacher/login`:

- `/teacher`
- `/teacher/invitations`
- `/teacher/children`
- `/teacher/attendance`
- `/teacher/reviews`
- `/teacher/materials`
- `/teacher/prep`
- (and any other teacher pages: activities, halaqa, demo-tools)

A logged-out user visiting any of these is redirected to `/teacher/login`.
Child / parent / `/join` routes are NOT gated.

---

## Invitation integration with the active teacher id

When a logged-in teacher creates an invitation, `createdByTeacherId` is set to
the active session's `teacherId` (e.g. `teacher-001`), and the invitations list
is scoped to that id. Creation is blocked when no session exists (the gate
ensures one is present). Portable invitation links (`?code=…&demoInvite=…`) are
unchanged and still work in a fresh browser.

---

## What passed (verification at this checkpoint)

- `npm run build` ✅
- `npm run lint` ✅ (clean)
- QA (fresh localStorage, multi-context) — **25/25**:
  - `/teacher` redirects to `/teacher/login`; dashboard not shown.
  - Invalid `BAD-CODE` → «كود المعلم غير صحيح»; no session created.
  - Valid `TCH-001` logs in as المعلم الأول; session `teacher-001`; dashboard
    shows the identity strip; `/teacher/invitations` works.
  - Creating an invitation uses the active teacher id (`teacher-001`).
  - Logout clears the session and returns to `/teacher/login`.
  - After logout, direct access to `/teacher`, `/teacher/invitations`,
    `/teacher/children`, `/teacher/attendance`, `/teacher/reviews`,
    `/teacher/materials`, `/teacher/prep` all require login.
  - Portable invitation links still open the family flow in a fresh context;
    family registration completes; the child switcher shows the children.
  - Submitting as نور is stored and reviewed as نور.
  - `/join` still asks for an invitation code; no halaqa-code wording; no
    multi-halaqa UI; no horizontal overflow.

---

## Known limitations

- **localStorage demo only** — all state lives in the browser; no server.
- **This is NOT real authentication** — it only gates the demo UI client-side;
  the seeded codes are hard-coded and trivially bypassable.
- **Production must replace this with backend auth/session** (real credentials,
  signed tokens/cookies, etc.).
- **Production must protect teacher routes server-side** — client-side gating is
  not a security boundary.
- **No backend / Auth yet.**
- **Final Security Launch Gate still required before launch.**
