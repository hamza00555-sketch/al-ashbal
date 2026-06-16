"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components";
import { cn } from "@/lib/cn";
import { IconBook, IconHome, IconTasks } from "./_icons";

/**
 * Child bottom navigation — only the 3 daily-core pages.
 * RTL visual order: الدروس (right) · الرئيسية (center, larger) · مهامي (left).
 *
 * Sizing note: the icon PNGs have a large transparent canvas (~50–65% fill),
 * so containers are FIXED and the artwork is enlarged with object-contain +
 * overflow-hidden + scale — the glyph grows, the bar height never does.
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
        "flex flex-1 flex-col items-center justify-end gap-0.5 text-[11px] leading-none transition",
        active ? "font-bold text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
      )}
    >
      <span className="flex size-14 items-center justify-center overflow-hidden">
        <AppIcon name={iconName} fallback={fallback} className="scale-[1.35]" />
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
      {/* fixed bar height (~76px); the larger center icon overflows upward without inflating it */}
      <div className="mx-auto flex h-[76px] w-full max-w-[430px] items-end justify-around gap-2 px-6 pb-2">
        {/* الدروس — يمين */}
        <SideLink
          href="/child/lessons"
          label="الدروس"
          active={isLessons}
          iconName="icon_lessons"
          fallback={<IconBook />}
        />

        {/* الرئيسية — المنتصف: الأيقونة فقط (بدون دائرة)، أكبر من الجانبين */}
        <Link
          href="/child"
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "flex flex-1 flex-col items-center justify-end gap-0.5 text-[11px] leading-none transition",
            isHome ? "font-bold text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
          )}
        >
          <span className="flex size-20 items-center justify-center overflow-hidden">
            <AppIcon name="icon_home" fallback={<IconHome />} className="scale-[1.4]" />
          </span>
          <span>الرئيسية</span>
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
