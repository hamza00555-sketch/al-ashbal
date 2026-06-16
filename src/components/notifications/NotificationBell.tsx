"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types";
import {
  ensureSeed,
  markNotificationRead,
  useDemoNotifications,
  type DemoNotification,
} from "@/lib/demo/notifications";
import { Drawer } from "../ui/Drawer";
import { AppIcon } from "../ui/AppIcon";
import { NotificationList, type NotificationListItem } from "./NotificationList";

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
 * Unified notifications bell. Merges the static (db) notifications passed as
 * `seed` into the demo notifications store, then shows the role-filtered list
 * for `userId` in a right-side drawer. Mark-read persists in the demo store.
 */
export function NotificationBell({
  userId,
  seed,
}: {
  userId: string;
  seed: AppNotification[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSelect(item: NotificationListItem) {
    markNotificationRead(item.id);
    if (item.href) {
      setOpen(false);
      router.push(item.href);
    }
  }

  useEffect(() => {
    const mapped: DemoNotification[] = seed.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      body: n.body,
      type: n.type,
      createdAt: n.createdAt,
      readAt: n.readAt,
    }));
    ensureSeed(mapped);
  }, [seed]);

  const notifications = useDemoNotifications(userId);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <button
        type="button"
        aria-label="التنبيهات"
        onClick={() => setOpen(true)}
        className="relative inline-flex size-12 items-center justify-center rounded-pill bg-surface-raised text-on-dark-muted transition hover:text-on-dark"
      >
        <span className="inline-flex size-10 items-center justify-center overflow-hidden"><AppIcon name="icon_notifications" fallback={<BellIcon />} className="scale-[1.25]" /></span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-pill bg-coral" />
        )}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="الإشعارات">
        <NotificationList notifications={notifications} onSelect={handleSelect} />
      </Drawer>
    </>
  );
}
