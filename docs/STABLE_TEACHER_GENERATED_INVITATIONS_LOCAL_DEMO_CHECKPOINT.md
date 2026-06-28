# Checkpoint — Teacher-Generated Invitations (Local Demo)

**Tag:** `stable-teacher-generated-invitations-local-demo`
**Branch:** `claude/pensive-hypatia-k6qnf3`
**Approved feature HEAD:** `a0cd26c` — `feat(demo): add teacher generated invitations`
**Previous stable checkpoint:** `292d8d2` — shared family device child switching
**Date:** 2026-06-28

This checkpoint approves teacher-generated invitations as the main onboarding
path. It is a documentation/checkpoint commit only — no UI, logic, or feature
changes were made to reach it.

---

## Summary — teacher-generated invitation model

Onboarding is now **invitation-first**: a teacher generates an invitation, shares
the link/code (WhatsApp-ready), and the family or student registers through it.
Open free role registration is no longer the main public path.

Three distinct codes remain separate and are not conflated:

- **invitation code** (`FAM-…` / `STD-…`) — starts registration at `/join`.
- **parent-link code** (`WLD-…`) — links a parent to an existing child.
- **child access code** (`TLB-…`) — opens a child profile on a device.

Store: `alashbal:demo-invitations` (`src/lib/demo/invitations.ts`).
`DemoInvitation` = `{ id, type, code, label?, createdByTeacherId, createdAt,
expiresAt?, revokedAt?, maxChildren?, maxParents?, usedChildrenCount,
usedParentsCount, usedAt? }`. Status is derived: `revoked` > `expired` > `active`.

---

## Family invitation behaviour

Teacher (`/teacher/invitations`) sets: optional label, allowed children (1–5),
allowed parents (default 1, stored for future), expiration days (default 7), then
«إنشاء دعوة عائلة». Output: code (`FAM-XXXX`), link `/join?code=FAM-XXXX`, and the
WhatsApp copy «أهلًا، هذه دعوة تسجيل عائلتكم في تطبيق الأشبال … {link}».

Family flow at `/join?code=FAM-…`:
1. «تسجيل ولي الأمر» — parent name (required).
2. «إضافة الأطفال» — up to `maxChildren` children (name required; age/level/avatar
   optional). Cannot exceed the allowed count.
3. On «إنهاء التسجيل»: creates the parent override + each child profile, links
   parent↔child, generates a **child access code** per child, and **adds each
   child to the device child list**.
4. Success «تم تسجيل العائلة بنجاح» shows each child's access code, plus links to
   the parent dashboard and the child switcher.

Family children then appear in `/parent`, `/parent/children`, `/child/switch`,
`/teacher/children` (with a «مسجل عبر دعوة» badge), and `/teacher/attendance`.

---

## Student invitation behaviour

Teacher sets: optional label + expiration days, then «إنشاء دعوة طالب». Output:
code (`STD-XXXX`), link, and the WhatsApp copy «أهلًا، هذه دعوة تسجيل طالب … {link}».

Student flow at `/join?code=STD-…`:
1. Student registers (name required; age/level/avatar optional).
2. Creates one child profile, **adds it to the device child list**, **sets it as
   the active child**, and shows the **parent-link code** with «أعطِ هذا الكود
   لولي أمرك ليربط حسابه بك».

Student invitations are **single-use** — reusing the code shows «تم استخدام هذه
الدعوة». The student appears immediately in `/teacher/children` and
`/teacher/attendance`. The parent can later link the student by the parent-link
code (no duplicate links).

---

## /join behaviour

- With `?code=…` → auto-validates and shows the matching family/student flow.
- With no code → shows an invitation-code input («لدي دعوة»).
- Invalid → «كود الدعوة غير صحيح»; expired → «انتهت صلاحية الدعوة»; revoked →
  «تم إيقاف هذه الدعوة»; family at capacity → «تم استخدام عدد الأطفال المسموح
  لهذه الدعوة».
- The invitation **type controls the path**: a family code never shows the
  student flow and vice-versa.

The teacher invitations list shows type, label, code, used-count/max, status
(نشطة / منتهية / موقوفة), copy link, and revoke.

---

## Shared family device integration

This feature is built on top of the shared-family-device child switcher
(checkpoint `292d8d2`) and preserves it:

- Family- and student-invitation children are added to the device child list
  (`addDeviceChildId`) so they show in `/child/switch` immediately.
- Selecting a child sets the active child; the student flow auto-activates the
  new student.
- Switching active child and submitting still routes correctly: a recording made
  as نور is stored under نور and shown as نور in parent approval and teacher
  review (never another sibling).

---

## Confirmations

- **Open role registration is no longer the main public path** — the landing
  leads with the invitation code («لدي دعوة» → `/join`). Teacher sign-in and a
  clearly-labelled «تجربة محلية» fallback are secondary; the old
  «تسجيل / دخول كطالب» main CTA is gone.
- **Halaqa-code onboarding is removed** — no «كود الحلقة / اختيار حلقة / الحلقات»
  wording appears anywhere in the onboarding/join/teacher surfaces.
- **No multi-halaqa UI exists** — a single internal class (`h1`) only; no halaqa
  selection.

---

## What passed (verification at this checkpoint)

- `npm run build` ✅
- `npm run lint` ✅ (clean)
- QA (fresh localStorage, headless Chromium with fake media) — **41/41**:
  - `/join` asks for an invitation code; landing is invitation-first; no open
    role CTA; no halaqa wording.
  - `/teacher/invitations` renders; family invitation created with code, link,
    WhatsApp copy, copy + revoke controls; appears in the list.
  - Family flow creates parent + 3 children; child access codes shown; children
    appear in `/parent/children`, `/child/switch`, `/teacher/children`,
    `/teacher/attendance`.
  - Student invitation creates one student, adds it to the device list, sets it
    active, shows the parent-link code, appears in the teacher roster, and is
    single-use.
  - Invalid → «كود الدعوة غير صحيح»; revoked → «تم إيقاف هذه الدعوة».
  - Shared-device regression: switch to نور, record + send, stored and reviewed
    as نور (not عبدالله) through parent approval and teacher review.
  - No halaqa wording; no horizontal overflow; long Arabic names fit.

---

## Known limitations

- **localStorage demo only** — all state lives in the browser; no server.
- **No backend / Auth yet** — profiles are not real accounts; no login.
- **Teacher login/signup not built yet** — there is no teacher authentication.
- **Teacher access is still demo/internal** — the teacher area is open in the
  demo; not gated behind a real account.
- **No teacher approval gate yet** — invited/registered children appear in the
  teacher roster immediately, with no review step.
- **Invitation links are local demo links only** — `/join?code=…` resolves
  against this browser's localStorage; codes do not work across devices/browsers.
- **`maxParents`** is stored for the future but only one parent profile is
  implemented in the family flow (MVP).
- **Final Security Launch Gate still required before launch.**
