/**
 * Tiny classname joiner (no external deps).
 * Falsy values are dropped, so conditional classes can be written as
 * `cond && "class"` or `cond ? "a" : "b"`.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
