"use client";

import { useState } from "react";
import type { AppNotification } from "@/types";
import { cn } from "@/lib/cn";

/**
 * Interactive (mock) notifications list. Clicking a row marks it read locally
 * (useState only — nothing is persisted).
 */
export function NotificationList({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const isRead = (n: AppNotification) => Boolean(n.readAt) || readIds.includes(n.id);
  const markRead = (id: string) =>
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  return (
    <div className="flex flex-col gap-2">
      {notifications.length > 0 ? (
        notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => markRead(n.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-md p-3 text-start transition hover:bg-white/5",
              isRead(n) && "opacity-60",
            )}
          >
            <span
              className={cn(
                "mt-1.5 inline-flex size-2 shrink-0 rounded-pill",
                isRead(n) ? "bg-white/25" : "bg-purple-soft",
              )}
            />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-body font-bold break-words">{n.title}</span>
              <span className="text-caption text-on-dark-muted break-words">{n.body}</span>
              {isRead(n) && <span className="text-caption text-mint">تمت القراءة</span>}
            </span>
          </button>
        ))
      ) : (
        <p className="text-body text-on-dark-muted">لا تنبيهات جديدة.</p>
      )}
      <p className="text-caption text-on-dark-muted">تجربة مؤقتة — لا يتم الحفظ الآن.</p>
    </div>
  );
}
