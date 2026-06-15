import { Avatar, type AvatarSize } from "@/components";
import { cn } from "@/lib/cn";
import type { ChildStatusLevel } from "@/lib/data";
import { CHILD_STATUS } from "./_shared";

/** Avatar wrapped in a status-colored ring (green / yellow / red). */
export function ChildStatusAvatar({
  name,
  level,
  size = "lg",
}: {
  name: string;
  level: ChildStatusLevel;
  size?: AvatarSize;
}) {
  return (
    <span className={cn("inline-flex shrink-0 rounded-pill p-0.5 ring-2", CHILD_STATUS[level].ring)}>
      <Avatar name={name} size={size} />
    </span>
  );
}
