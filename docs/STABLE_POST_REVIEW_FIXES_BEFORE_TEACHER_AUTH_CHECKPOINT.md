# Checkpoint — Post-Review Fixes, Before Teacher Auth

**Tag:** `stable-post-review-fixes-before-teacher-auth`
**Branch:** `claude/pensive-hypatia-k6qnf3`
**Approved HEAD:** `ea8ad34`
**Date:** 2026-06-28

This checkpoint stabilizes the branch after the full code + design review fixes,
and confirms the Supabase backend foundation is intact. Documentation only — no
app/UI/logic changes were made to reach it.

---

## Review fixes accepted (the 4 commits)

1. **`407853b` — fix(demo): correct multi-child submission identity and display**
   - Submissions keyed per `(task, child)` (`taskId::childId`, with legacy-key
     migration on read) — siblings no longer overwrite/block each other on the
     same assignment.
   - Self-registered students with no linked parent: submission goes straight to
     `pending_teacher` (button says «إرسال للمعلم»); parents linked later via the
     WLD code are now counted in `parentIds`; `pushNotification` skips empty
     userIds.
   - Girls display the avatar actually picked at registration (gender derived
     from the chosen avatar); parent approvals use the created-store-aware
     `ChildDisplayAvatar`.
   - Teacher page header shows the login-session name (matches the «مسجل كمعلم»
     strip); access-code error copy unified («كود الدخول غير صحيح»).
2. **`f36c29f` — chore: remove dead review pipeline and legacy halaqa store**
   - Deleted the superseded review pipeline (workflow.ts + 3 components, zero
     importers) and the inert legacy `halaqaEnrollment.ts` (~275 lines).
   - Demo-tools reset completed: «إعادة ضبط التسميعات» + «مسح بيانات العائلات
     والدعوات».
3. **`12f863a` — refactor: extract shared form and button primitives**
   - `Field/Input/Select` (replaces 12 duplicated `inputClass` copies + color
     drift), `LinkButton`/`buttonStyles` (one primary-CTA recipe + focus rings),
     `EmptyState` (7 teacher pages), shared `AvatarPicker` + `CHILD_AVATARS`/
     `CHILD_LEVELS` (replaces 3 implementations, adds ولد/بنت aria-labels).
4. **`ea8ad34` — feat(demo): polish invitations ux, navigation, and accessibility**
   - Copy buttons for child access / parent-link codes on the /join success
     screens; revoke-invitation confirmation modal; expiry date in the
     invitations list; distinct tile icons (الدعوات = lantern, المواد = book);
     الدعوات + المواد added to the teacher sidebar; aria-labels on
     placeholder-only inputs; `dir="ltr"` on Latin code fields; landing contrast
     raised; new `--color-on-light-muted` token.

## Supabase integrity confirmation

- All backend commits present in history: `79cd877` (Phase 1a schema),
  `9c536b2` (1a audit), `dea91cf` (Phase 1b scaffolding), `766f6ac` (1b audit),
  `959472a` (live setup docs).
- Files intact: `supabase/migrations/001–008`, `supabase/README.md`,
  `src/lib/supabase/*` (6 files), `src/lib/backend/*` (9 files), `.env.example`,
  `scripts/verify-supabase.mjs`, and the four Supabase docs.
- Safety: no service-role value committed; no `.env`/`.env.local` tracked; **no
  frontend file imports any supabase/backend module** (nothing wired); the app
  still runs entirely on localStorage (15 demo stores in use).

## QA summary (22/22 ✅, fresh localStorage, headless Chromium + fake media)

- **Multi-child submissions:** عبدالله and نور both submitted the SAME task →
  two separate submissions; parent sees both approval cards; teacher sees both;
  accepting one credits points to exactly ONE child (no mixing).
- **Student without parent:** self-registered مازن submits → state goes straight
  to `pending_teacher`; zero notifications written to an empty userId.
- **Invitations:** family invitation + portable link work in a fresh browser;
  child access codes copyable («نسخ الكود»); revoke asks confirmation; unknown
  code-only URL shows the helpful local-demo message and a bad payload link
  shows «كود الدعوة غير صحيح».
- **Child switcher:** both children appear; switching works; the submission
  confirmation shows the active child's name for each sibling.
- **Teacher gate:** logged-out `/teacher` → login; TCH-001 logs in; after logout
  teacher pages require login again.
- `npm run lint` ✅ · `npm run build` ✅.

## Known limitations

- **App behavior is still localStorage** — Supabase is scaffolding only.
- **Supabase live project still needs user setup** — follow
  `docs/SUPABASE_LIVE_PROJECT_SETUP.md`, then `npm run verify:supabase`.
- **Teacher Auth not implemented yet** — the teacher gate is the local demo code.
- **Final Security Launch Gate still required before public launch.**
