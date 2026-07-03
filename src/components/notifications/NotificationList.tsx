"use client";

import { cn } from "@/lib/cn";

export interface NotificationListItem {
  id: string;
  title: string;
  body: string;
  readAt?: string;
  href?: string;
}

/**
 * Presentational notifications list. Read state is driven by `readAt`; clicking
 * an item calls `onSelect` (the bell marks it read and follows any href).
 */
export function NotificationList({
  notifications,
  onSelect,
}: {
  notifications: NotificationListItem[];
  onSelect?: (item: NotificationListItem) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {notifications.length > 0 ? (
        notifications.map((n) => {
          const read = Boolean(n.readAt);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelect?.(n)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md p-3 text-start transition hover:bg-purple/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft",
                // Read items are dimmed but still readable (opacity-60 was too faint).
                read && "opacity-75",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 inline-flex size-2 shrink-0 rounded-pill",
                  read ? "bg-purple/25" : "bg-purple",
                )}
              />
              <span className="flex min-w-0 flex-col gap-1">
                {/* Explicit colors: the drawer is a LIGHT panel — never inherit
                    the page's cream text (was unreadable white-on-cream). */}
                <span className="text-body font-bold break-words text-on-dark">{n.title}</span>
                <span className="text-caption break-words text-on-light-muted">{n.body}</span>
                {n.href && <span className="text-caption font-bold text-purple">اضغط للانتقال ←</span>}
                {read && <span className="text-caption text-on-light-muted">تمت القراءة ✓</span>}
              </span>
            </button>
          );
        })
      ) : (
        <p className="text-body text-on-light-muted">لا تنبيهات جديدة.</p>
      )}
      <p className="text-caption text-on-light-muted">تجربة مؤقتة — لا يتم الحفظ الآن.</p>
    </div>
  );
}
