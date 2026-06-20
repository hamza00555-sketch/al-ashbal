import { cn } from "@/lib/cn";

/**
 * Arabic-safe name text for headers/cards.
 * - Single word (no spaces): never breaks letter-by-letter; uses nowrap +
 *   ellipsis (truncate) so a very long word shrinks safely instead of breaking.
 * - Multiple words: wraps naturally to at most 2 lines, never breaking inside a
 *   word ([word-break:keep-all]).
 * The surrounding header keeps the action button fixed (shrink-0) — this only
 * controls how the name itself behaves.
 */
export function ResponsiveNameText({ name, className }: { name: string; className?: string }) {
  const single = !/\s/.test(name.trim());
  return (
    <span
      className={cn(
        "block min-w-0 [word-break:keep-all]",
        single ? "truncate" : "line-clamp-2",
        className,
      )}
      title={name}
    >
      {name}
    </span>
  );
}
