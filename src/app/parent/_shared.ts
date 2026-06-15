/* Shared helper for the parent pages (keeps pages thin). */
import { getMockUser, getVisibleChildren } from "@/lib/data";
import type { ChildProfile, User } from "@/types";

/** Resolve the current (mock) parent viewer + their linked children only. */
export function getParentContext(): { viewer: User; children: ChildProfile[] } {
  const viewer = getMockUser("parent");
  return { viewer, children: getVisibleChildren(viewer) };
}
