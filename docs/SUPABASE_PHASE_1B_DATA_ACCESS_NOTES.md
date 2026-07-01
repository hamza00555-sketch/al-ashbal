# Supabase Phase 1b — Data Access Scaffolding Notes

**Branch:** `claude/pensive-hypatia-k6qnf3` · built on Phase 1a audit `9c536b2`.
**Scope:** Supabase client/server/admin utilities, env helpers, backend types,
data-access function signatures, and the child-device-grant token strategy that
resolves the Phase 1a audit findings H1 & H2.
**Behavior change:** **none.** Nothing in the app imports this scaffolding; the app
still runs entirely on localStorage. ⚠️ Do not wire these into UI in this phase.

---

## Files added

**`src/lib/supabase/`**
- `env.ts` — lazy env getters (client-safe vs server-only) + `assertServerOnly()`.
- `database.ts` — minimal `Database` generic for the typed client (extend later /
  replace with generated types).
- `types.ts` — hand-written backend row types.
- `client.ts` — browser client (public env only).
- `server.ts` — ⚠️ server-only user-session client (anon key + cookies; RLS applies).
- `admin.ts` — ⚠️ server-only service-role client (bypasses RLS).

**`src/lib/backend/`** (data-access layer)
- `errors.ts` — `BackendAuthError`, `BackendPermissionError`, `BackendValidationError`,
  `BackendNotFoundError`, `BackendConflictError`, `NotImplementedBackendError`.
- `childDeviceGrants.ts` — **real** grant hashing + validation (H1/H2 core).
- `auth.ts`, `teacher.ts`, `invitations.ts`, `children.ts`, `parentChildLinks.ts`,
  `submissions.ts`, `recordings.ts` — typed function signatures with full JSDoc
  (caller / auth / inputs / outputs / tables / security), throwing
  `NotImplementedBackendError` until their phase wires them.

Packages added: `@supabase/supabase-js`, `@supabase/ssr` (+ lockfile).

## Supabase clients created

| Client | Key | Runs | RLS | Use for |
|---|---|---|---|---|
| `getSupabaseBrowserClient()` | anon (public) | browser | yes | future client reads |
| `createSupabaseServerClient()` | anon (public) + cookies | **server only** | yes (as the user) | reads/writes AS the signed-in teacher/parent |
| `getSupabaseAdminClient()` | **service role** | **server only** | **bypasses RLS** | ops needing bypass AFTER server-side authz (invitation consumption, acting for a granted child) |

## Env behavior

- Getters are **lazy** — they read `process.env` only when called, so the app
  builds/runs without Supabase envs (nothing imports them into a live path yet).
- Client-safe: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_APP_URL`. Server-only: `SUPABASE_SERVICE_ROLE_KEY`, optional
  `CHILD_GRANT_TOKEN_PEPPER`. Bucket: `SUPABASE_STORAGE_BUCKET_RECORDINGS`.

## Service-role safety rules

- `admin.ts` and `childDeviceGrants.ts` call `assertServerOnly()` → throw if ever
  evaluated in the browser. The service-role key getter is server-only too.
- **Never** import `admin.ts` / `server.ts` / `childDeviceGrants.ts` into a client
  component. Verified: no app/component imports any backend/supabase module yet.
- The service role bypasses RLS, so it is used ONLY after the server performs its
  own authorization (e.g. `requireTeacher`, `requireChildGrant`, invitation guards).

## Child device grant token strategy (resolves H1 & H2)

1. The **device** holds a high-entropy **raw** token in localStorage
   (`generateChildGrantToken()` → 256-bit, base64url).
2. The **database** stores **only** `hash(rawToken)` in
   `child_device_grants.grant_token_hash` (never the raw token).
3. On a sensitive child op, the device sends its **raw** token to a server action.
4. The server hashes it (`hashGrantToken`: HMAC-SHA256 with a server pepper if set,
   else SHA-256) and looks up the child's active grants via the **admin client**.
5. It compares `hash(raw)` to each stored hash in **constant time**
   (`timingSafeEqual`), checking `child_id`, not-expired, not-revoked.
6. Only on a match does the server act for that child — via the admin client,
   scoped to the validated `child_id`.

**H1 resolved:** the child/device path is **server-mediated (admin client)**, not a
direct `anon`-role client read — so the `to authenticated` RLS policies never block
a legitimate device, and a device needs no Supabase Auth session.

**H2 resolved:** the server hashes the **raw** token and compares `hash(raw)` to the
stored hash. The raw token (the real credential) is never compared directly to, nor
equal to, the stored hash. A DB leak of `grant_token_hash` alone cannot be replayed
(you still need the raw token, plus the optional server pepper). MVP limitation: if
no pepper is set, hashing is unsalted SHA-256, so tokens **must** be high-entropy
random (they are).

**Why `activeChildId` stays local but is not trusted:** `activeChildId` (and the
device's grant tokens) live in localStorage as a UI convenience. The backend
authorizes every child op by **validating the grant token**, never by trusting the
client's `activeChildId`/`child_id`.

## What remains unwired (intentionally)

- No UI imports any of this; teacher gate, invitations, child switcher, submissions,
  and recordings all still use localStorage.
- No real Auth, no backend invitations/registration, no recording uploads.
- All `*.ts` data-access functions except the grant hashing/validation throw
  `NotImplementedBackendError` (with exact intended behavior documented in JSDoc).
- `has_child_grant`'s RLS GUC path (migration 006) is still optional belt-and-
  suspenders; the primary device path is the server-action+admin flow above.

## Live project status

The migrations are **validated locally** but **not applied to a live Supabase
project** yet (no live credentials in this environment). Before Phase 2, the user
must create a project and apply `supabase/migrations/001–008` — see
**`docs/SUPABASE_LIVE_PROJECT_SETUP.md`** and run `npm run verify:supabase`.

## Next phase recommendation

**Phase 2 — real teacher Auth + server-side route protection.** Wire
`createSupabaseServerClient()` + middleware to replace the local teacher gate
(`requireTeacher`, `getCurrentTeacherProfile`), keeping child/parent/join on
localStorage. Then Phase 3 (backend invitations + `/join`). The child-device grant
functions here get wired in **Phase 5**, and recordings in **Phase 7**.
**Prerequisite:** a live Supabase project with the migrations applied
(SUPABASE_LIVE_PROJECT_SETUP.md).
