/*
  Child DEVICE GRANT tokens held by THIS device (Phase 2 — client side of the
  H1/H2 model). The raw token is the device's credential for acting as a
  child; the database stores only its hash. localStorage keeps the raw token
  ON THIS DEVICE ONLY — it is never a "session" and never trusted by itself:
  every sensitive child server action re-validates it server-side
  (validateChildDeviceGrant). activeChildId remains a UI preference only.
*/

export interface StoredChildGrant {
  childId: string;
  token: string; // raw grant token (device credential)
  storedAt: string;
}

const KEY = "alashbal:child-device-grants";

function readAll(): StoredChildGrant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(grants: StoredChildGrant[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(grants));
}

export function storeChildGrant(childId: string, token: string): void {
  const rest = readAll().filter((g) => g.childId !== childId);
  writeAll([...rest, { childId, token, storedAt: new Date().toISOString() }]);
}

export function getChildGrant(childId: string): string | null {
  return readAll().find((g) => g.childId === childId)?.token ?? null;
}

export function getAllChildGrants(): StoredChildGrant[] {
  return readAll();
}

export function removeChildGrant(childId: string): void {
  writeAll(readAll().filter((g) => g.childId !== childId));
}
