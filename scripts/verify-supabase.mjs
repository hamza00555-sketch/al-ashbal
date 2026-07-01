#!/usr/bin/env node
/*
  Verify a live Supabase project matches the Phase 1a foundation.
  Safe read-only checks — does NOT modify data. Run only after you have created a
  project and a local `.env.local` (or exported the env vars):

    npm run verify:supabase

  Checks: env vars present · connectivity · core tables reachable (service role) ·
  anon cannot enumerate a sensitive table (RLS) · recordings bucket private.

  Uses ONLY the already-installed @supabase/supabase-js. Never commit `.env.local`.
*/
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- tiny .env.local loader (no extra deps) ---
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const log = (...a) => console.log(...a);
let failed = 0;
const ok = (n) => log("  ✅", n);
const bad = (n) => { failed++; log("  ❌", n); };

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET_RECORDINGS || "recordings";

log("\n== Supabase env ==");
if (URL) ok("NEXT_PUBLIC_SUPABASE_URL set"); else bad("NEXT_PUBLIC_SUPABASE_URL missing");
if (ANON) ok("NEXT_PUBLIC_SUPABASE_ANON_KEY set"); else bad("NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
if (SERVICE) ok("SUPABASE_SERVICE_ROLE_KEY set (server-only)"); else bad("SUPABASE_SERVICE_ROLE_KEY missing");
ok(`bucket name = "${BUCKET}"`);

if (!URL || !ANON || !SERVICE) {
  log("\nMissing env vars — create .env.local (see docs/SUPABASE_LIVE_PROJECT_SETUP.md). Aborting.\n");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

const TABLES = [
  "profiles", "teacher_profiles", "parent_profiles", "classes", "class_teachers",
  "children", "class_students", "parent_child_links", "invitations",
  "invitation_uses", "child_access_codes", "parent_link_codes", "child_device_grants",
  "learning_materials", "lessons", "daily_prep", "assignments", "submissions",
  "parent_approvals", "teacher_reviews", "points_ledger", "child_progress",
  "attendance_records", "audit_events",
];

log("\n== Core tables reachable (service role) ==");
let missing = 0;
for (const t of TABLES) {
  const { error } = await admin.from(t).select("*", { head: true, count: "exact" }).limit(0);
  if (error && error.code === "42P01") { bad(`table "${t}" MISSING`); missing++; }
  else if (error) { bad(`table "${t}" error: ${error.message}`); }
}
if (missing === 0) ok(`all ${TABLES.length} core tables exist`);

log("\n== RLS smoke test (anon must NOT enumerate) ==");
for (const t of ["invitations", "children", "submissions"]) {
  const { data, error } = await anon.from(t).select("id").limit(1);
  const rows = data?.length ?? 0;
  // RLS denies → either a permission error or 0 rows. Rows returned = RED FLAG.
  if (rows > 0) bad(`anon read "${t}" returned ${rows} row(s) — RLS may be too open!`);
  else ok(`anon cannot enumerate "${t}"${error ? " (blocked)" : " (0 rows)"}`);
}

log("\n== Storage: recordings bucket ==");
const { data: bucket, error: bErr } = await admin.storage.getBucket(BUCKET);
if (bErr || !bucket) bad(`bucket "${BUCKET}" not found — apply migration 008`);
else if (bucket.public) bad(`bucket "${BUCKET}" is PUBLIC — must be private`);
else ok(`bucket "${BUCKET}" exists and is private`);

log(`\n== ${failed === 0 ? "PASS ✅" : `FAIL ❌ (${failed})`} ==`);
log("Note: authoritative RLS/function checks are in the dashboard Advisors + the");
log("checklist in docs/SUPABASE_LIVE_PROJECT_SETUP.md.\n");
process.exit(failed === 0 ? 0 : 1);
