import type { ReactNode } from "react";

/** A single navigation entry shared by MobileNav and DesktopSidebar. */
export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** When set, the item renders as a link; otherwise it calls onSelect. */
  href?: string;
  /** Optional count pill (e.g. pending reviews). Hidden when 0/undefined. */
  badge?: number;
}
