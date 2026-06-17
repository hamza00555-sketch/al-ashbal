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

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

export function Badge({
  tone = "neutral",
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-caption font-bold leading-none",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {icon && <span className="inline-flex size-4 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
