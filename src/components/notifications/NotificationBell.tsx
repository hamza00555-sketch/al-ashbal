"use client";

import { useState } from "react";
import type { AppNotification } from "@/types";
import { Drawer } from "../ui/Drawer";
import { NotificationList } from "./NotificationList";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <path
        d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Unified notifications bell. Opens a right-side drawer (RTL) listing mock
 * notifications; the unread count reflects server-unread items, and individual
 * items can be marked read locally inside the list.
 */
export function NotificationBell({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <button
        type="button"
        aria-label="التنبيهات"
        onClick={() => setOpen(true)}
        className="relative inline-flex size-9 items-center justify-center rounded-pill bg-surface-raised text-on-dark-muted transition hover:text-on-dark"
      >
        <span className="inline-flex size-5"><BellIcon /></span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-pill bg-coral" />
        )}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="الإشعارات">
        <NotificationList notifications={notifications} />
      </Drawer>
    </>
  );
}
