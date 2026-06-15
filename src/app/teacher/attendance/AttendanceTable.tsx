"use client";

import { useState } from "react";
import { Avatar } from "@/components";
import { cn } from "@/lib/cn";

type Status = "present" | "late" | "absent";

const OPTIONS: { id: Status; label: string; active: string }[] = [
  { id: "present", label: "حاضر", active: "bg-mint/20 text-mint" },
  { id: "late", label: "متأخر", active: "bg-gold/20 text-gold" },
  { id: "absent", label: "غائب", active: "bg-coral/20 text-coral" },
];

export interface AttendanceRow {
  childId: string;
  name: string;
  initial: Status;
}

/** Mock attendance editor — status changes live in local state only. */
export function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
  const [state, setState] = useState<Record<string, Status>>(() =>
    Object.fromEntries(rows.map((r) => [r.childId, r.initial])),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-body">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-start text-caption font-bold text-on-dark-muted">الطفل</th>
              <th className="p-4 text-start text-caption font-bold text-on-dark-muted">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const current = state[row.childId];
              return (
                <tr key={row.childId} className="border-b border-white/5 last:border-0">
                  <td className="p-4 whitespace-nowrap">
                    <span className="flex items-center gap-3">
                      <Avatar name={row.name} size="sm" />
                      <span className="font-bold">{row.name}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {OPTIONS.map((opt) => {
                        const isActive = current === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setState((s) => ({ ...s, [row.childId]: opt.id }))}
                            className={cn(
                              "rounded-pill px-4 py-1 text-caption font-bold transition",
                              isActive ? opt.active : "bg-surface-raised text-on-dark-muted hover:text-on-dark",
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-caption text-on-dark-muted">التغيير تجريبي وغير محفوظ.</p>
    </div>
  );
}
