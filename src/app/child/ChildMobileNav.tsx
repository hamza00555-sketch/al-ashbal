"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components";
import { cn } from "@/lib/cn";
import { IconBook, IconHome, IconTasks } from "./_icons";

/**
 * Child bottom navigation — intentionally only the 3 daily-core pages.
 * RTL visual order: الدروس (right) · الرئيسية (center, raised) · مهامي (left).
 * تقدّمي/أمنياتي are reached from cards on the home page, not from this bar.
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
        "flex flex-1 flex-col items-center gap-1 py-2 text-caption transition",
        active ? "font-bold text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
      )}
    >
      <span className="inline-flex size-6 items-center justify-center">
        <AppIcon name={iconName} fallback={fallback} className="scale-150" />
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface/95 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex w-full max-w-[430px] items-end justify-around gap-2 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {/* الدروس — يمين (أول عنصر في DOM يظهر يمينًا في RTL) */}
        <SideLink
          href="/child/lessons"
          label="الدروس"
          active={isLessons}
          iconName="icon_lessons"
          fallback={<IconBook />}
        />

        {/* الرئيسية — المنتصف، زر دائري مرتفع 3D */}
        <Link
          href="/child"
          aria-current={isHome ? "page" : undefined}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <span
            className={cn(
              "-mt-8 inline-flex size-16 items-center justify-center rounded-full ring-4 ring-surface transition",
              "shadow-[0_10px_24px_-6px_rgba(123,76,217,0.65)]",
              isHome
                ? "gradient-cta text-cream"
                : "bg-surface-raised text-purple-soft hover:brightness-110",
            )}
          >
            <span className="inline-flex size-9 items-center justify-center">
              <AppIcon name="icon_home" fallback={<IconHome />} className="scale-150" />
            </span>
          </span>
          <span className={cn("text-caption", isHome ? "font-bold text-purple-soft" : "text-on-dark-muted")}>
            الرئيسية
          </span>
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
