/*
  A next/link styled EXACTLY like <Button> (same variants/sizes/focus ring) —
  for navigations that look like actions. Server-safe (no "use client"), so it
  works in server pages and client components alike.
*/
import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      className={buttonClasses({
        variant,
        size,
        fullWidth,
        className: typeof className === "string" ? className : undefined,
      })}
      {...rest}
    >
      {children}
    </Link>
  );
}
