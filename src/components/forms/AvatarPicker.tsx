"use client";

/*
  Shared avatar picker for child registration (was re-implemented in JoinFlow,
  StudentOnboarding, and LinkChildPicker). Each option carries a distinct
  aria-label (ولد/بنت) so assistive tech can tell the choices apart.
*/
import { cn } from "@/lib/cn";
import { CHILD_AVATARS } from "@/lib/childOptions";
import { Avatar, type AvatarSize } from "../ui/Avatar";

export function AvatarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: string;
  onChange: (src: string) => void;
  size?: AvatarSize;
}) {
  return (
    <div className="flex gap-2">
      {CHILD_AVATARS.map((option) => (
        <button
          key={option.src}
          type="button"
          aria-label={option.label}
          aria-pressed={value === option.src}
          onClick={() => onChange(option.src)}
          className={cn(
            "rounded-pill p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft",
            value === option.src ? "ring-2 ring-purple" : "ring-1 ring-purple/15 hover:ring-purple/40",
          )}
        >
          <Avatar name={option.label} size={size} src={option.src} />
        </button>
      ))}
    </div>
  );
}
