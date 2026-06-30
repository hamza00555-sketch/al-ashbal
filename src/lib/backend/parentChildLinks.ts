/*
  Parent ↔ child linking (Phase 1b scaffolding — stubs; NOT wired).
*/
import { NotImplementedBackendError } from "./errors";

/**
 * linkParentToChildByCode — parent claims a self-registered student by WLD code.
 *   Caller: server (parent). Auth: session role='parent'. Input: { code }.
 *   Output: { childId }. Tables: parent_link_codes (validate active/unconsumed),
 *   parent_child_links (insert, parent_id = caller). Security: consume the code in
 *   one transaction; no duplicate link (unique parent_id+child_id) →
 *   BackendConflictError on re-link.
 */
export async function linkParentToChildByCode(input: {
  code: string;
}): Promise<{ childId: string }> {
  throw new NotImplementedBackendError("linkParentToChildByCode", { input });
}
