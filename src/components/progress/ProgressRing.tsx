import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ProgressRingTone = "purple" | "gold" | "success";

const strokeClasses: Record<ProgressRingTone, string> = {
  purple: "text-purple",
  gold: "text-gold",
  success: "text-mint",
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: ProgressRingTone;
  /** Centered main label; defaults to the rounded percentage. */
  label?: ReactNode;
  sublabel?: ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 10,
  tone = "purple",
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const pct = clamp(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={typeof label === "string" ? label : `${Math.round(pct)}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-purple/12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn("transition-[stroke-dashoffset]", strokeClasses[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-card-title font-extrabold text-on-dark">
          {label ?? `${Math.round(pct)}%`}
        </span>
        {sublabel && <span className="text-caption text-on-dark-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
