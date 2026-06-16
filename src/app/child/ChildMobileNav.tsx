"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components";
import { cn } from "@/lib/cn";
import { IconBook, IconHome, IconTasks } from "./_icons";

/**
 * Child bottom navigation — only the 3 daily-core pages.
 * RTL visual order: الدروس (right) · الرئيسية (center, raised) · مهامي (left).
 *
 * Sizing note: the icon PNGs have a large transparent canvas (~50–65% fill),
 * so containers are FIXED and the artwork is enlarged with object-contain +
 * overflow-hidden + a small scale — the glyph grows, the button/bar never do.
 */
function SideLink({
  href,
  label,
  active,
  iconName,
  fallback,
}: {
  href: string;
  label: string;
  active: boolean;
  iconName: string;
  fallback: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-end gap-1 text-[11px] leading-none transition",
        active ? "font-bold text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
      )}
    >
      {/* fixed 48px slot — artwork scaled inside, container never grows */}
      <span className="flex size-12 items-center justify-center overflow-hidden">
        <AppIcon name={iconName} fallback={fallback} className="scale-[1.2]" />
      </span>
      <span className="w-full truncate text-center">{label}</span>
    </Link>
  );
}

export function ChildMobileNav() {
  const pathname = usePathname();
  const isHome = pathname === "/child";
  const isLessons = pathname === "/child/lessons";
  const isTasks = pathname === "/child/tasks";

  return (
    <nav
      aria-label="التنقل"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {/* fixed bar height (~76px) so the raised center button never inflates it */}
      <div className="mx-auto flex h-[76px] w-full max-w-[430px] items-end justify-around gap-2 px-6 pb-2">
        {/* الدروس — يمين */}
        <SideLink
          href="/child/lessons"
          label="الدروس"
          active={isLessons}
          iconName="icon_lessons"
          fallback={<IconBook />}
        />

        {/* الرئيسية — المنتصف، زر دائري متوسط مرتفع قليلًا */}
        <Link
          href="/child"
          aria-current={isHome ? "page" : undefined}
          className="flex flex-1 flex-col items-center justify-end gap-1 text-[11px] leading-none"
        >
          {/* fixed 72px circle — artwork scaled inside, button size locked */}
          <span
            className={cn(
              "flex size-18 items-center justify-center overflow-hidden rounded-full ring-4 ring-surface transition",
              "shadow-[0_8px_20px_-6px_rgba(123,76,217,0.6)]",
              isHome
                ? "gradient-cta text-cream"
                : "bg-surface-raised text-purple-soft hover:brightness-110",
            )}
          >
            <AppIcon name="icon_home" fallback={<IconHome />} className="scale-[1.15]" />
          </span>
          <span className={cn(isHome ? "font-bold text-purple-soft" : "text-on-dark-muted")}>الرئيسية</span>
        </Link>

        {/* مهامي — يسار */}
        <SideLink
          href="/child/tasks"
          label="مهامي"
          active={isTasks}
          iconName="icon_tasks"
          fallback={<IconTasks />}
        />
      </div>
    </nav>
  );
}
