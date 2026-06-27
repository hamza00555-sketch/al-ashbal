import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChildAmbientMotion, ParentAmbientMotion } from "./AmbientMotion";

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
  /**
   * Continuous ambient motion behind the content. ONLY for Child/Parent areas
   * (Teacher stays calm). Pointer-events-none + clipped, so it never affects
   * layout, scrolling, or clicks. Disabled under prefers-reduced-motion (CSS).
   */
  ambient?: "child" | "parent";
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
  ambient,
  children,
  className,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh bg-cover bg-center bg-no-repeat text-cream",
        // Calm dark base by default; image keys (ref/abstract/journey) are opt-in.
        backgroundKey === "none" ? "app-surface" : cn("bg-surface", BACKGROUND_CLASS[backgroundKey]),
        className,
      )}
    >
      {sidebar}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {header && <div className="relative z-10 px-4 pt-4 sm:px-6 sm:pt-5">{header}</div>}
        <main className="relative flex-1 overflow-x-clip px-4 py-4 pb-24 sm:px-6 md:pb-6">
          {ambient === "child" && <ChildAmbientMotion />}
          {ambient === "parent" && <ParentAmbientMotion />}
          <div className="relative z-10">{children}</div>
        </main>
      </div>
      {mobileNav}
    </div>
  );
}
