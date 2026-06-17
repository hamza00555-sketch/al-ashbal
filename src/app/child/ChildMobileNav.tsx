"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppAssetIcon } from "@/components";
import { cn } from "@/lib/cn";
import { IconBook, IconHome, IconTasks } from "./_icons";

/**
 * Child bottom navigation — only the 3 daily-core pages.
 * RTL visual order: الدروس (right) · الرئيسية (center, larger) · مهامي (left).
 * Icons use the unified AppAssetIcon (fixed container + scaled artwork).
 */
function SideLink({
  href,
  label,
  active,
  src,
  fallback,
  artworkScale,
}: {
  href: string;
  label: string;
  active: boolean;
  src: string;
  fallback: React.ReactNode;
  artworkScale?: number;
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
      <AppAssetIcon src={src} size="nav" variant="nav" artworkScale={artworkScale} fallback={fallback} />
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.35)] md:hidden"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[430px] items-end justify-around gap-2 px-6 pb-2">
        {/* الدروس — يمين (أيقونتها فيها هامش أكبر فتحتاج scale أعلى) */}
        <SideLink
          href="/child/lessons"
          label="الدروس"
          active={isLessons}
          src="/assets/icons/icon_lessons.png"
          fallback={<IconBook />}
          artworkScale={1.7}
        />

        {/* الرئيسية — المنتصف: أكبر (hero) وبلا دائرة */}
        <Link
          href="/child"
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "flex flex-1 flex-col items-center justify-end gap-0.5 text-[11px] leading-none transition",
            isHome ? "font-bold text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
          )}
        >
          <AppAssetIcon src="/assets/icons/icon_home.png" size="hero" variant="plain" fallback={<IconHome />} />
          <span>الرئيسية</span>
        </Link>

        {/* مهامي — يسار */}
        <SideLink
          href="/child/tasks"
          label="مهامي"
          active={isTasks}
          src="/assets/icons/icon_tasks.png"
          fallback={<IconTasks />}
        />
      </div>
    </nav>
  );
}
