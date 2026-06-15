import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ProgressTone = "purple" | "gold" | "success";

const fillClasses: Record<ProgressTone, string> = {
  purple: "gradient-cta",
  gold: "gradient-badge",
  success: "bg-mint",
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  tone?: ProgressTone;
  label?: ReactNode;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  tone = "purple",
  label,
  showValue = true,
  className,
}: ProgressBarProps) {
  const pct = clamp(value);
  const rounded = Math.round(pct);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-caption text-on-dark-muted">
          <span>{label}</span>
          {showValue && <span>{rounded}%</span>}
        </div>
      )}
      <div
        className="h-3 w-full overflow-hidden rounded-pill bg-white/10"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Normal flow: in RTL the fill starts from the inline-start (right). */}
        <div
          className={cn("h-full rounded-pill transition-[width]", fillClasses[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
