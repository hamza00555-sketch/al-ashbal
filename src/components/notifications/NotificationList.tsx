"use client";

import { cn } from "@/lib/cn";

export interface NotificationListItem {
  id: string;
  title: string;
  body: string;
  readAt?: string;
}

/**
 * Presentational notifications list. Read state is driven by `readAt`; clicking
 * an item calls `onRead` (the demo store persists it). No internal state.
 */
export function NotificationList({
  notifications,
  onRead,
}: {
  notifications: NotificationListItem[];
  onRead?: (id: string) => void;
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
              onClick={() => onRead?.(n.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md p-3 text-start transition hover:bg-white/5",
                read && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 inline-flex size-2 shrink-0 rounded-pill",
                  read ? "bg-white/25" : "bg-purple-soft",
                )}
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-body font-bold break-words">{n.title}</span>
                <span className="text-caption text-on-dark-muted break-words">{n.body}</span>
                {read && <span className="text-caption text-mint">تمت القراءة</span>}
              </span>
            </button>
          );
        })
      ) : (
        <p className="text-body text-on-dark-muted">لا تنبيهات جديدة.</p>
      )}
      <p className="text-caption text-on-dark-muted">تجربة مؤقتة — لا يتم الحفظ الآن.</p>
    </div>
  );
}
