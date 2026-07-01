"use client";

/*
  Copy-to-clipboard button with inline feedback («تم النسخ» for a moment) —
  unifies the two clipboard behaviours that existed (with/without feedback).
*/
import { useEffect, useRef, useState } from "react";
import { Button, type ButtonProps } from "./Button";

export function CopyButton({
  text,
  label = "نسخ",
  copiedLabel = "تم النسخ ✓",
  variant = "secondary",
  size = "sm",
  ...rest
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
} & Omit<ButtonProps, "onClick" | "children">) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (e.g. insecure context) — leave the label as-is
    }
  }

  return (
    <Button variant={variant} size={size} onClick={copy} {...rest}>
      {copied ? copiedLabel : label}
    </Button>
  );
}
