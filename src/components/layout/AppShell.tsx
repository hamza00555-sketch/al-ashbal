import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Background direction keys → responsive (mobile/desktop) image utilities.
 *  Class strings are LITERAL so Tailwind's JIT picks them up. When the PNG is
 *  absent the image silently fails and the `bg-surface` color shows (no break). */
export type AppBackgroundKey = "abstract" | "ref" | "journey" | "none";

const BACKGROUND_CLASS: Record<AppBackgroundKey, string> = {
  abstract:
    "bg-[url('/backgrounds/background_abstract_mobile.png')] md:bg-[url('/backgrounds/background_abstract_desktop.png')]",
  ref: "bg-[url('/backgrounds/background_ref_mobile.png')] md:bg-[url('/backgrounds/background_ref_desktop.png')]",
  journey:
    "bg-[url('/backgrounds/background_journey_mobile.png')] md:bg-[url('/backgrounds/background_journey_desktop.png')]",
  none: "",
};

export interface AppShellProps {
  /** Desktop sidebar slot (hidden on mobile by the component itself). */
  sidebar?: ReactNode;
  /** Mobile bottom navigation slot (hidden on desktop by the component itself). */
  mobileNav?: ReactNode;
  /** Optional sticky-ish header area above the main content. */
  header?: ReactNode;
  /** App background direction. Falls back to bg-surface color if the file is missing. */
  backgroundKey?: AppBackgroundKey;
  children: ReactNode;
  className?: string;
}

/**
 * App layout frame. RTL-first: in a flex row under dir="rtl" the sidebar
 * naturally sits on the right (inline-start). Extra bottom padding on mobile
 * keeps content clear of the bottom nav.
 *
 * A calm brand background image (per `backgroundKey`) is layered over the
 * `bg-surface` color; cards sit opaque on top. If the image file is not present
 * yet, only the solid color shows — so the app never breaks.
 */
export function AppShell({
  sidebar,
  mobileNav,
  header,
  backgroundKey = "none",
  children,
  className,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh bg-cover bg-center bg-no-repeat text-on-dark",
        // Calm dark base by default; image keys (ref/abstract/journey) are opt-in.
        backgroundKey === "none" ? "app-surface" : cn("bg-surface", BACKGROUND_CLASS[backgroundKey]),
        className,
      )}
    >
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header && <div className="px-6 pt-6">{header}</div>}
        <main className="flex-1 px-6 py-6 pb-24 md:pb-6">{children}</main>
      </div>
      {mobileNav}
    </div>
  );
}
