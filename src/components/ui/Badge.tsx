import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  // Unified status system: each tone has a clear fill + 1px stroke + light
  // readable text, so tags never dissolve into the purple cards. No mint/cyan.
  gold: "gradient-badge text-on-light", // achievements / awards only
  success: "bg-[rgba(47,191,120,0.22)] text-cream ring-1 ring-[rgba(47,191,120,0.55)]", // حاضر / تم — emerald
  warning: "bg-[rgba(240,199,94,0.22)] text-[#FFF2C2] ring-1 ring-[rgba(240,199,94,0.55)]", // متأخر / بانتظار — gold
  danger: "bg-[rgba(233,137,126,0.22)] text-[#FFE4DF] ring-1 ring-[rgba(233,137,126,0.58)]", // غائب / مرفوض — coral
  purple: "bg-[rgba(181,140,255,0.20)] text-cream ring-1 ring-[rgba(201,174,255,0.40)]", // قيد المراجعة / فئات — lavender
  neutral: "bg-[rgba(247,241,234,0.16)] text-cream ring-1 ring-[rgba(247,241,234,0.30)]", // اليوم / وقت / عام
};

// Light-card variant: darker text + light fill, readable ON cream contrast cards.
const toneClassesLight: Record<BadgeTone, string> = {
  gold: "gradient-badge text-on-light",
  success: "bg-[#E3F3EA] text-[#1E5C3A] ring-1 ring-[#1E5C3A]/30",
  warning: "bg-[#FBEFD0] text-[#7A4B00] ring-1 ring-[#7A4B00]/35",
  danger: "bg-[#FBE2DD] text-[#8A2C20] ring-1 ring-[#8A2C20]/35",
  purple: "bg-[#ECE3FF] text-[#3A1A6E] ring-1 ring-[#3A1A6E]/25",
  neutral: "bg-[#ECE6F5] text-[#3A2E55] ring-1 ring-[#3A2E55]/20",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
  /** Use the darker light-card palette (for cream contrast cards). */
  onLight?: boolean;
}

export function Badge({
  tone = "neutral",
  icon,
  onLight = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-caption font-bold leading-none",
        (onLight ? toneClassesLight : toneClasses)[tone],
        className,
      )}
      {...rest}
    >
      {icon && <span className="inline-flex size-4 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
