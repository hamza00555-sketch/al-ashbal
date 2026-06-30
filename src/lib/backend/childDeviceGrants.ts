/*
  Child device grants (Phase 1b scaffolding) — the H1/H2 resolution from the
  Phase 1a audit.

  ⚠️ SERVER-ONLY (uses node:crypto + the admin/service-role client). Runs in the
  Node.js server runtime (NOT the Edge runtime — node:crypto). Never import into a
  client component.

  Model (how a shared family device proves it may act for a child):
    - The DEVICE holds a high-entropy RAW grant token in localStorage.
    - The DATABASE stores ONLY hash(rawToken) in child_device_grants.grant_token_hash.
    - On each sensitive child operation the device sends its RAW token to a SERVER
      action. The server hashes it (hashGrantToken) and looks up a matching,
      unexpired, unrevoked grant for THAT child using the admin client.
    - Only if that lookup succeeds does the server act for the child — using the
      admin client (service role) scoped to that child_id.

  Why this resolves the audit findings:
    - H1: the child/device path is SERVER-MEDIATED (admin client), not a direct
      anon-role client read. The `to authenticated` RLS policies don't block it,
      and the device never needs a Supabase Auth session.
    - H2: the server hashes the RAW token and compares hash(raw) === stored hash.
      The raw token (the real credential) is never compared directly to, nor equal
      to, the stored hash. A DB read of grant_token_hash alone cannot be replayed
      (you still need the raw token, and the optional server pepper).

  activeChildId stays in device localStorage as a UI convenience ONLY. The backend
  NEVER trusts activeChildId; authorization is the validated grant token.
*/
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { assertServerOnly, getChildGrantPepper } from "../supabase/env";
import { getSupabaseAdminClient } from "../supabase/admin";
import { BackendAuthError, BackendValidationError } from "./errors";
import type { ChildDeviceGrant, Uuid } from "../supabase/types";

const GRANT_TABLE = "child_device_grants" as const;
const DEFAULT_TTL_DAYS = 30;

/**
 * Hash a raw grant token for storage/lookup. Uses HMAC-SHA256 with a server-only
 * pepper when CHILD_GRANT_TOKEN_PEPPER is set, else plain SHA-256.
 *
 * MVP limitation (documented): plain SHA-256 is unsalted, so it relies entirely on
 * the token being HIGH-ENTROPY and random (see generateChildGrantToken). Set the
 * pepper in production so a leaked hash table cannot be brute-forced offline.
 * NEVER expose the pepper to the client.
 */
export function hashGrantToken(rawToken: string): string {
  assertServerOnly("hashGrantToken");
  if (!rawToken || rawToken.length < 16) {
    throw new BackendValidationError("Grant token is missing or too short");
  }
  const pepper = getChildGrantPepper();
  return pepper
    ? createHmac("sha256", pepper).update(rawToken).digest("hex")
    : createHash("sha256").update(rawToken).digest("hex");
}

/** Generate a high-entropy raw grant token (server-side). Returned to the device
 *  ONCE; only its hash is stored. */
export function generateChildGrantToken(): string {
  assertServerOnly("generateChildGrantToken");
  return randomBytes(32).toString("base64url"); // 256-bit
}

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * createChildDeviceGrant — mint a grant for a child on a device.
 *   Caller: server action, AFTER validating a child-access (TLB) code OR after a
 *           parent/teacher authorized adding a device.
 *   Auth:   server-side (admin client). The caller must have already authorized.
 *   Input:  { childId, createdFromCodeId?, label?, ttlDays? }.
 *   Output: { rawToken, grant } — rawToken is returned ONCE for the device.
 *   Tables: child_device_grants (insert). Security: stores hash only.
 */
export async function createChildDeviceGrant(input: {
  childId: Uuid;
  createdFromCodeId?: Uuid | null;
  label?: string | null;
  ttlDays?: number;
}): Promise<{ rawToken: string; grant: ChildDeviceGrant }> {
  assertServerOnly("createChildDeviceGrant");
  const rawToken = generateChildGrantToken();
  const expiresAt = new Date(
    Date.now() + (input.ttlDays ?? DEFAULT_TTL_DAYS) * 86_400_000,
  ).toISOString();
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from(GRANT_TABLE)
    .insert({
      child_id: input.childId,
      grant_token_hash: hashGrantToken(rawToken),
      grant_label: input.label ?? null,
      created_from_code_id: input.createdFromCodeId ?? null,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error || !data) throw new BackendValidationError("Could not create grant", { error });
  return { rawToken, grant: data };
}

/**
 * validateChildDeviceGrant — H2 core. Verify a device's RAW token for a child.
 *   Caller: every sensitive child server action.
 *   Auth:   the raw token IS the credential; validated server-side here.
 *   Input:  { childId, rawToken }.
 *   Output: the matching ChildDeviceGrant, or throws BackendAuthError.
 *   Tables: child_device_grants (select; updates last_used_at). Security: hashes
 *           the raw token and matches the stored hash; constant-time compare.
 */
export async function validateChildDeviceGrant(input: {
  childId: Uuid;
  rawToken: string;
}): Promise<ChildDeviceGrant> {
  assertServerOnly("validateChildDeviceGrant");
  const tokenHash = hashGrantToken(input.rawToken);
  const admin = getSupabaseAdminClient();
  // Fetch the child's active grants and compare in app code (constant-time), so
  // we support multiple devices per child and avoid DB-side equality on the secret.
  const { data, error } = await admin
    .from(GRANT_TABLE)
    .select()
    .eq("child_id", input.childId)
    .is("revoked_at", null);
  if (error) throw new BackendAuthError("Grant lookup failed", { error });
  const now = Date.now();
  const grant = (data ?? []).find(
    (g) =>
      constantTimeEquals(g.grant_token_hash, tokenHash) &&
      (g.expires_at === null || Date.parse(g.expires_at) >= now),
  );
  if (!grant) throw new BackendAuthError("Invalid or expired child device grant");
  await admin
    .from(GRANT_TABLE)
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", grant.id);
  return grant;
}

/**
 * requireChildGrant — throw unless the device is authorized for the child.
 *   Returns the validated grant (use its child_id downstream — never the client's
 *   activeChildId). Caller: gate at the top of child server actions.
 */
export async function requireChildGrant(input: {
  childId: Uuid;
  rawToken: string;
}): Promise<ChildDeviceGrant> {
  return validateChildDeviceGrant(input);
}

/**
 * revokeChildDeviceGrant — revoke one device's access to a child.
 *   Caller: parent/teacher server action (after authorizing). Tables: update
 *   child_device_grants.revoked_at.
 */
export async function revokeChildDeviceGrant(grantId: Uuid): Promise<void> {
  assertServerOnly("revokeChildDeviceGrant");
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from(GRANT_TABLE)
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", grantId);
  if (error) throw new BackendValidationError("Could not revoke grant", { error });
}

/**
 * getDeviceAccessibleChildren — resolve which children a device may act for.
 *   Caller: child switcher server action. Validates each raw token the device
 *   holds and returns the child ids with a currently-valid grant.
 *   Input:  raw tokens held by the device (with their childId).
 *   Output: child ids the device is authorized for.
 */
export async function getDeviceAccessibleChildren(
  tokens: ReadonlyArray<{ childId: Uuid; rawToken: string }>,
): Promise<Uuid[]> {
  assertServerOnly("getDeviceAccessibleChildren");
  const out: Uuid[] = [];
  for (const t of tokens) {
    try {
      await validateChildDeviceGrant(t);
      out.push(t.childId);
    } catch {
      // skip invalid/expired grants
    }
  }
  return out;
}
