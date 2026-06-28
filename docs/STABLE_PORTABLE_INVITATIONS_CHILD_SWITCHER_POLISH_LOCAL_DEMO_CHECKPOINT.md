# Checkpoint — Portable Invitation Links + Child Switcher Polish (Local Demo)

**Tag:** `stable-portable-invitations-child-switcher-polish-local-demo`
**Branch:** `claude/pensive-hypatia-k6qnf3`
**Approved feature HEAD:** `5fc577a` — `fix(demo): make invitation links portable and polish child switcher`
**Previous checkpoint:** `92b74d1` — teacher-generated invitations
**Date:** 2026-06-28

This checkpoint approves portable local-demo invitation links and the child
switcher polish. It is a documentation/checkpoint commit only — no UI, logic, or
feature changes were made to reach it.

---

## Summary — portable invitation link behaviour

Invitations live in the creating browser's localStorage, so a bare
`/join?code=FAM-…` link opened in a different browser/incognito could not find
the invitation and showed «كود الدعوة غير صحيح». To make the demo flow truly
shareable, the teacher's link now carries a small, **non-secret** encoded
payload:

```
/join?code=FAM-8K42&demoInvite=<base64url-json>
```

- The payload (`encodeInvitePayload` in `src/lib/demo/invitations.ts`) contains
  only: `v`, `code`, `type`, `label`, `maxChildren`, `maxParents`, `createdAt`,
  `expiresAt`. No secrets. UTF-8 → base64url, so Arabic labels survive and the
  string is URL-safe.
- The teacher **Copy link** button and the **Copy WhatsApp message** both copy
  the full portable link (code + demoInvite). The WhatsApp text stays clean.

---

## How /join hydrates demo invitations from the URL payload

On load (`src/app/join/JoinFlow.tsx`):

1. Resolve the `code` from localStorage first (`useInvitationByCode`).
2. If found → use the stored invitation (existing behaviour).
3. If not found **and** a `demoInvite` payload is present and decodes to a
   matching code/valid type → `hydrateInvitationFromPayload` writes the
   invitation into THIS browser's localStorage (with fresh usage counters, and
   it is written even if expired so the normal expiry/revoke errors still apply),
   then the store hook re-resolves it and the correct family/student flow opens.
   A brief «جارٍ قراءة الدعوة…» is shown while hydrating.
4. If not found and there is **no usable payload** (e.g. a code typed manually in
   a fresh browser) → a helpful message:
   «لم نتمكن من قراءة الدعوة في هذا المتصفح. افتح الرابط الكامل الذي أرسله المعلم
   أو اطلب دعوة جديدة.»

Existing errors are unchanged: invalid → «كود الدعوة غير صحيح» (when a payload is
present but unusable), expired → «انتهت صلاحية الدعوة», revoked → «تم إيقاف هذه
الدعوة». The hydration write is gated by an effect with a one-shot ref (no
re-hydration loops, no `setState` in the effect).

The decode/hydrate code is explicitly commented as a **LOCAL DEMO fallback** to
be replaced by a real backend invitation lookup before launch.

---

## Child switcher polish summary

Visual/text only — no switcher logic changed:

- The title «من يستخدم التطبيق الآن؟» is **no longer duplicated**. Previously the
  page hero and an in-card title both showed it. Now each screen shows it once:
  the gate renders a single `PageHeader` hero; `/child/switch` uses the page's
  `PageHeader`; the picker body keeps only a lighter helper line
  «اختر ملفك حتى تُسجّل النقاط والتسميع باسمك الصحيح.».
- A single child card is centered (no awkward floating); cards are fixed-width
  and not enlarged; the bottom nav and global density are unchanged.
- «تبديل التجربة» uses the existing quiet/compact variant so it no longer
  competes visually with the real child selection.

---

## What passed (verification at this checkpoint)

- `npm run build` ✅
- `npm run lint` ✅ (clean)
- QA across **isolated browser contexts** (true separate localStorage) — **22/22**:
  - Teacher creates family + student invitations; copied link includes the code +
    portable `demoInvite` payload; the WhatsApp message includes the full working
    link.
  - Opening `/join?code=FAM-…&demoInvite=…` in a **fresh** context hydrates the
    invitation and opens family registration (no «كود الدعوة غير صحيح»); family
    registration completes from the portable link.
  - Opening `/join?code=STD-…&demoInvite=…` in a fresh context opens student
    registration and shows the parent-link code.
  - Manual code-only in fresh storage shows the helpful local-demo message and
    does not crash.
  - Invalid / expired / revoked invitation errors still work.
  - Child switcher title is not duplicated (exactly one); supports multiple
    children on one device; no horizontal overflow.
  - Submitting as نور is stored and reviewed as نور (shared-device regression).
  - No halaqa-code onboarding wording; no multi-halaqa UI.

---

## Known limitations

- **localStorage demo only** — all state lives in the browser; no server.
- **`demoInvite` payload is NOT secure** — it is plaintext (base64url, no
  signature, no encryption) and exists only to make links portable in the local
  demo. It carries no secrets and must not be trusted.
- **Production must replace this** with a real backend invitation lookup
  (invitation id → server record); manual code-only entry can only resolve an
  invitation that exists in the current browser without a backend.
- **No backend / Auth yet.**
- **No teacher login/signup yet** — the teacher area is demo/internal.
- **Final Security Launch Gate still required before launch.**
