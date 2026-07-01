# Supabase Phase 1b — Data Access Scaffolding Audit

> Review of the Phase 1b scaffolding at commit `dea91cf`. **Review-only — no code,
> app, UI, or migrations changed** (no critical issue warranted a fix). Verified
> with lint, a no-env build, and the risky-usage greps mandated by the task.

---

## 1. Verdict

**PASS.** The scaffolding is safe and correctly bounded: the service-role key
cannot reach the browser, the server-only modules are unreachable from the UI, the
build passes with zero Supabase envs, the child-device-grant strategy resolves the
Phase 1a audit findings H1/H2, and every unfinished data-access function throws
`NotImplementedBackendError` (no silent fake success). No Critical or High
findings. A few Low/optional hardening notes only. **The Teacher Auth phase can
start.**

## 2. Critical findings (must fix before Teacher Auth)

**None.**

## 3. High findings (should fix before Teacher Auth)

**None.**

## 4. Medium / Low findings (optional, can wait)

- **L1 — No `import "server-only"` marker.** `admin.ts`, `server.ts`, and
  `childDeviceGrants.ts` rely on a **runtime** `assertServerOnly()` guard + naming,
  not the build-time `server-only` package. This is *safe* because Next.js never
  inlines non-`NEXT_PUBLIC_` env vars into client bundles — so even if a module
  were accidentally imported client-side, `SUPABASE_SERVICE_ROLE_KEY` would be
  `undefined` in the browser and `assertServerOnly()` would throw. *Optional
  hardening:* add `import "server-only"` to make accidental client imports a
  **build error**. (Not required; would add one tiny dep.)
- **L2 — `CHILD_GRANT_TOKEN_PEPPER` not in `.env.example`.** `env.ts` reads this
  optional server-only pepper, but it is not documented in the env template. Add it
  (commented, optional) so future devs know it exists. No security impact (absent →
  documented plain-SHA-256 with high-entropy tokens).
- **L3 — 2 moderate npm-audit advisories** (transitive, reported at install). Not
  introduced by scaffolding logic; out of scope here. Note for a later dependency
  hardening pass.

## 5. Service-role safety summary — **PASS**

- `SUPABASE_SERVICE_ROLE_KEY` is referenced only in `env.ts` (`getServiceRoleKey`,
  which calls `assertServerOnly` first) and an `admin.ts` comment. It is **never**
  `NEXT_PUBLIC_`-prefixed, so Next.js does not ship its value to the client bundle.
- `getSupabaseAdminClient()` (service role, bypasses RLS) is imported **only** by
  `src/lib/backend/childDeviceGrants.ts` (a server-only module). `server.ts` is
  imported by nothing yet. **No app route/component imports any server-only
  module** (grep-verified).
- `assertServerOnly()` throws if `admin.ts` / `server.ts` / `childDeviceGrants.ts`
  ever run in the browser (defense-in-depth on top of Next's env stripping).
- No `service_role` literal and no real secret values are committed (`.env.example`
  placeholders are blank; `SUPABASE_SERVICE_ROLE_KEY` is clearly marked server-only).
- The browser client (`client.ts`) uses only `getPublicSupabaseEnv()` (URL + anon
  key). No `NEXT_PUBLIC_*` variable carries a secret.

## 6. Child-grant safety summary (H1/H2) — **PASS**

- **Raw token is never stored.** `createChildDeviceGrant` inserts only
  `grant_token_hash: hashGrantToken(rawToken)` and returns the raw token to the
  caller once (for the device). DB stores hash only.
- **Raw token is hashed server-side before comparison.** `validateChildDeviceGrant`
  computes `hashGrantToken(rawToken)` and compares it to the stored hash — the raw
  value is never compared to, nor equal to, the stored hash (**H2 resolved**).
- **Comparison is constant-time.** `constantTimeEquals` uses `crypto.timingSafeEqual`
  (length-checked). Grants are fetched by `child_id` (supports multiple devices) and
  each stored hash is compared in app code, avoiding DB-side equality on the secret.
- **Server-mediated path (H1 resolved).** Validation uses the admin client
  server-side, so the device (an `anon`-role client with no Auth session) is not
  blocked by the `to authenticated` RLS policies; the server acts for the child
  only after a valid grant.
- **`activeChildId` is not trusted.** It is documented (code + notes) as a
  localStorage UI convenience only; authorization is the validated grant token.
- Hashing uses HMAC-SHA256 with a server pepper when set, else SHA-256 (documented
  MVP limitation → requires high-entropy tokens; `generateChildGrantToken()` uses
  256-bit random).

## 7. Env / build behavior summary — **PASS**

- `npm run build` **passes with no `SUPABASE_*` env vars set** (confirmed) — env
  getters are lazy and nothing imports them into a live path.
- Missing required vars throw a **clear runtime error** (`Missing required
  environment variable: …`) only when a getter is actually called.
- `.env.example` separates client-safe (`NEXT_PUBLIC_*`) from the server-only
  secret with an explicit "never expose / bypasses RLS" warning.
- `lint` clean; TypeScript type-check clean.

## 8. Backend-stub & package review

- **Stubs:** `auth`, `teacher`, `invitations`, `children`, `parentChildLinks`,
  `submissions`, `recordings` — every unfinished function **throws
  `NotImplementedBackendError`**; **no stub returns a fake success**. Signatures are
  typed and each documents caller / auth / inputs / outputs / tables / security.
  Sensitive future writes (registration, invitation consumption, approvals, reviews,
  recording upload) are planned as **server actions / RPCs**, not direct client
  writes (submissions has no client write policy in RLS).
- **Real code:** only `childDeviceGrants.ts` (grant hashing/validation) — audited
  above.
- **Packages:** only `@supabase/supabase-js@2.110.0` + `@supabase/ssr@0.12.0` added
  (package.json +2 lines); lockfile consistent (`npm install --package-lock-only
  --dry-run` → no changes); no unrelated packages.

## 9. Behavior-unchanged verification — **PASS**

Commit `dea91cf` touched **no** `src/app/`, `src/components/`, `src/lib/demo/`, or
`src/lib/auth/` file (grep-verified) — so `/join`, the local teacher gate, the child
switcher, submissions, and all localStorage flows are byte-identical to the prior
checkpoint. Only new `src/lib/supabase/*`, `src/lib/backend/*`, docs, `package*.json`,
and a `supabase/README.md` pointer were added. Routes unchanged; build/lint pass.

---

## Whether the Teacher Auth phase can start

**Yes.** Phase 2 (real teacher Supabase Auth + server-side route protection) can
begin. Use `createSupabaseServerClient()` + middleware to implement
`requireTeacher` / `getCurrentTeacherProfile`, replacing the local teacher gate,
while keeping child/parent/join on localStorage. Optionally apply L1 (add
`import "server-only"`) and L2 (document the pepper) as light hardening along the
way; neither blocks Phase 2.

## Fixes needed

None. (Low notes L1–L3 are optional and documented above with exact file/issue/fix.)
