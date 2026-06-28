# Checkpoint — Shared Family Device Child Switching (Local Demo)

**Tag:** `stable-shared-family-device-child-switching-local-demo`
**Branch:** `claude/pensive-hypatia-k6qnf3`
**Approved feature HEAD:** `040e60b` — `feat(demo): support shared family device child switching`
**Previous checkpoint:** `a5231b7` — role onboarding + parent↔child linking
**Date:** 2026-06-28

This checkpoint approves the shared-family-device child experience. It is a
documentation/checkpoint commit only — no UI, logic, or feature changes were
made to reach it.

---

## Summary of shared family device behaviour

One family device can hold **multiple child profiles**. The child area no longer
assumes one device = one child. Instead it resolves an **active child** and uses
that identity for every child page and every submission.

- Opening any `/child/*` page with **no active child** shows the profile picker
  «من يستخدم التطبيق الآن؟» (an in-layout gate) instead of a dashboard.
- Picking a profile («هذا أنا») sets the active child; the dashboard then shows a
  small identity strip «تستخدم التطبيق الآن باسم: …» with a «تبديل الطفل» action.
- `/child/switch` is the dedicated switcher (same picker). It is reachable from
  the identity strip and from the submission confirmation.
- `/child/start` (onboarding) and `/child/switch` are **not** gated.
- A child can be activated on the device by entering a **child access code**
  («لدي كود دخول طفل»). An invalid code shows «كود الدخول غير صحيح».
- All child tasks/progress/lessons/wishes and the recording/submission flow use
  the **active child id/name**, so siblings stay separated.

The three distinct codes remain separate and are not conflated:
invitation code · parent-link code (WLD) · child access code (TLB).

---

## Active child storage keys / helpers

**Active child (reused existing store) — `src/lib/demo/onboarding.ts`**
- Key: `alashbal:demo-active-child` (event `alashbal:demo-active-child-changed`)
- `setActiveChild(childId)` · `getActiveChildId()` · `clearActiveChildId()` ·
  `useActiveChildId()`

**Device child list — `src/lib/demo/deviceChildren.ts`**
- Key: `alashbal:demo-device-child-ids`
  (event `alashbal:demo-device-child-ids-changed`)
- `getDeviceChildIds()` · `addDeviceChildId(id)` · `removeDeviceChildId(id)`
- `getAvailableChildrenForThisDevice()` · `getSeedDemoChild()`
- Hooks: `useAvailableChildren()` · `useResolvedActiveChild()` · `useHydrated()`

> Note: the existing `alashbal:demo-active-child` key was kept (rather than the
> spec's suggested `…-active-child-id`) so the existing onboarding/join flows
> that already call `setActiveChild` keep working.

**Gate + context — `src/app/child/ChildExperienceGate.tsx`**
- `ChildExperienceGate` (wraps the child layout) and `useActiveChild()` (context
  consumed by the child pages).

---

## How available children are resolved

`getAvailableChildrenForThisDevice()` merges these sources, **created/local
resolving before seed**, de-duplicated by id:

1. Parent-created children on this device (createdChildren store)
2. Children linked to the parent on this device (onboarding parent links)
3. Children explicitly activated on this device (device child-ids list — e.g. a
   child access code)
4. The self-registered student profile on this device (createdChildren store)
5. The active child id (always included)

The seed/demo child is **not** part of this list; it is offered separately as a
clearly-labelled «تجربة محلية» fallback only.

---

## Submission identity confirmation behaviour

In the recording modal (`src/app/child/tasks/RecordTaskModal.tsx`):

- After recording, the active child's identity is shown plainly:
  **«سيتم إرسال التسجيل باسم: ‹الطفل›»**.
- Pressing «إرسال لولي الأمر» shows a final confirmation step:
  - Title: **تأكيد الإرسال**
  - Text: **«سيتم إرسال هذا التسجيل باسم ‹الطفل›.»**
  - Actions: **نعم، أرسل** · **تغيير الطفل** (→ `/child/switch`)
- The submission is stored under the active child's `childId` / `childName`, so
  parent approval, teacher review, and points all reflect the correct child.

---

## What passed (verification at this checkpoint)

- `npm run build` ✅
- `npm run lint` ✅ (clean)
- QA (fresh localStorage, headless Chromium with fake media) — **26/26**:
  - `/child` with no active child shows the picker «من يستخدم التطبيق الآن؟»;
    «لدي كود دخول طفل» present; no silent seed dashboard.
  - Parent-created children (عبدالله / نور / سارة) appear in the selector.
  - A self-registered + linked child (خالد) appears in the selector.
  - A child activated by access code (سارة) appears / becomes active.
  - Selecting عبدالله makes عبدالله the active child.
  - Switching to نور makes نور the active child; `/child`, `/child/progress`,
    `/child/lessons` all use نور.
  - Recording shows «سيتم إرسال التسجيل باسم: نور» and the final «تأكيد الإرسال»
    confirmation; submission stored under نور's child id.
  - Parent approval shows نور; teacher review shows نور (not عبدالله).
  - Points are keyed by the submission's child id → credited to the correct
    child only (no cross-child leakage).
  - Invalid child access code shows «كود الدخول غير صحيح»; active child unchanged.
  - No PIN/password, no backend/Auth, no halaqa-code onboarding, no multi-halaqa
    UI.
  - No horizontal overflow; long Arabic names fit in the selector.

---

## Known limitations

- **localStorage demo only** — all state lives in the browser; no server.
- **No backend / Auth yet** — profiles are not real accounts; there is no login.
- **No child PIN yet** — switching profiles is a simple visual choice; identity
  is confirmed visually before submissions. An optional child PIN may be added
  later.
- **Device child list is local to the browser/device** — children added on one
  device/browser do not appear on another.
- **Self-registered + parent-linked children**: a child who self-registers and is
  linked to a parent only via the parent-link code does not yet carry that linked
  parent into the submission routing (`parentUserId`), because the resolved
  profile derives `parentIds` from `createdByParentId` only. Parent approval
  routing is fully exercised for parent-created children (the main path).
  Reflecting parent-link relationships for self-registered children is a later
  refinement.
- **Final Security Launch Gate still required before launch.**
