#!/usr/bin/env node
/*
  Bootstrap the FIRST teacher account (Phase 2 — real Supabase Auth).
  There is NO public signup: teacher accounts are created only by this script,
  run by the project owner on their own machine.

    TEACHER_EMAIL=teacher@example.com \
    TEACHER_PASSWORD='a-strong-password' \
    TEACHER_DISPLAY_NAME='الأستاذ خالد' \
    npm run bootstrap:teacher

  (The three TEACHER_* vars can also live temporarily in `.env.local` — remove
  TEACHER_PASSWORD after a successful run.)

  What it does (idempotent — safe to re-run):
    1. Create the auth user (email confirmed) — or reuse an existing one.
       An existing user's password is NEVER changed here.
    2. Upsert profiles(id, role='teacher', display_name).
    3. Upsert teacher_profiles(id).
    4. Attach the teacher to the default class in class_teachers.

  Uses the SERVICE ROLE key (server-side only; RLS bypassed on purpose —
  class_teachers has no client INSERT policy by design). This script NEVER
  prints keys or the password.
*/
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- tiny .env.local loader (no extra deps; real env vars win) ---
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
const fail = (msg) => { console.error("❌", msg); process.exit(1); };

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = (process.env.TEACHER_EMAIL || "").trim().toLowerCase();
const PASSWORD = process.env.TEACHER_PASSWORD || "";
const DISPLAY_NAME = (process.env.TEACHER_DISPLAY_NAME || "").trim() || "المعلم";
const CLASS_ID_OVERRIDE = (process.env.TEACHER_CLASS_ID || "").trim();

if (!URL) fail("NEXT_PUBLIC_SUPABASE_URL is missing (.env.local).");
if (!SERVICE) fail("SUPABASE_SERVICE_ROLE_KEY is missing (.env.local, server-only).");
if (!EMAIL || !EMAIL.includes("@")) fail("TEACHER_EMAIL is missing or invalid.");
if (PASSWORD.length < 8) fail("TEACHER_PASSWORD is missing or shorter than 8 characters.");

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---- 1) auth user (create, or reuse existing — never touch its password) ----
let userId = null;
let reused = false;
{
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (!error) {
    userId = data.user.id;
  } else if (/already|exists|registered/i.test(error.message)) {
    reused = true;
    // find the existing user by email (paged scan — fine at bootstrap scale)
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data: pageData, error: listErr } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (listErr) fail(`Could not list users: ${listErr.message}`);
      userId = pageData.users.find(
        (u) => (u.email || "").toLowerCase() === EMAIL,
      )?.id ?? null;
      if (pageData.users.length < 200) break;
    }
    if (!userId) fail(`A user with this email exists but was not found by listing.`);
  } else {
    fail(`Could not create auth user: ${error.message}`);
  }
}
log(reused
  ? "✅ auth user already exists — reused (password NOT changed)"
  : "✅ auth user created (email confirmed)");

// ---- 2) profiles ----
{
  const { error } = await admin
    .from("profiles")
    .upsert({ id: userId, role: "teacher", display_name: DISPLAY_NAME }, { onConflict: "id" });
  if (error) fail(`profiles upsert failed: ${error.message}`);
  log(`✅ profiles: role=teacher, display_name="${DISPLAY_NAME}"`);
}

// ---- 3) teacher_profiles ----
{
  const { error } = await admin
    .from("teacher_profiles")
    .upsert({ id: userId }, { onConflict: "id" });
  if (error) fail(`teacher_profiles upsert failed: ${error.message}`);
  log("✅ teacher_profiles row ensured");
}

// ---- 4) attach to the default class ----
{
  let classId = CLASS_ID_OVERRIDE || null;
  let className = null;
  if (classId) {
    const { data, error } = await admin
      .from("classes").select("id,name").eq("id", classId).maybeSingle();
    if (error) fail(`classes read failed: ${error.message}`);
    if (!data) fail(`TEACHER_CLASS_ID "${classId}" not found.`);
    className = data.name;
  } else {
    const { data, error } = await admin
      .from("classes")
      .select("id,name")
      .eq("archived", false)
      .order("created_at", { ascending: true })
      .limit(1);
    if (error) fail(`classes read failed: ${error.message}`);
    if (!data?.length) fail("No class found — seed one first (see docs/SUPABASE_LIVE_PROJECT_SETUP.md).");
    classId = data[0].id;
    className = data[0].name;
  }

  const { data: existing, error: selErr } = await admin
    .from("class_teachers")
    .select("id")
    .eq("class_id", classId)
    .eq("teacher_id", userId)
    .maybeSingle();
  if (selErr) fail(`class_teachers read failed: ${selErr.message}`);
  if (existing) {
    log(`✅ already attached to class "${className}"`);
  } else {
    const { error } = await admin
      .from("class_teachers")
      .insert({ class_id: classId, teacher_id: userId });
    if (error) fail(`class_teachers insert failed: ${error.message}`);
    log(`✅ attached to class "${className}"`);
  }
}

log(`\n== DONE ✅ ==
Teacher: ${DISPLAY_NAME} <${EMAIL}>
User id: ${userId}
Sign in at /teacher/login with this email and the password you provided.
(No secrets were printed. If TEACHER_PASSWORD is in .env.local, remove it now.)`);
