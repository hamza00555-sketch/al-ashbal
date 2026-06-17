"use client";

import { useState } from "react";
import { Button, Card, SectionTitle } from "@/components";
import {
  resetActivities,
  resetActivityAnswers,
} from "@/lib/demo/activities";
import { resetLessonPrep } from "@/lib/demo/lessonPrep";
import { resetStudentAssignments } from "@/lib/demo/studentAssignments";
import { resetNotifications } from "@/lib/demo/notifications";
import { resetPoints } from "@/lib/demo/points";
import { clearAllRecordings } from "@/lib/demo/recordings";

interface ResetItem {
  title: string;
  desc: string;
  confirm: string;
  /** sync reset (localStorage) */
  run?: () => void;
  /** async reset (IndexedDB) */
  runAsync?: () => Promise<void>;
  danger?: boolean;
}

const ITEMS: ResetItem[] = [
  {
    title: "إعادة ضبط الأنشطة",
    desc: "يحذف الأنشطة المنشأة فقط (لا يحذف إجابات الطلاب).",
    confirm: "حذف كل الأنشطة التجريبية؟",
    run: resetActivities,
  },
  {
    title: "إعادة ضبط إجابات الأنشطة",
    desc: "يحذف إجابات الطلاب على الأنشطة فقط.",
    confirm: "حذف كل إجابات الأنشطة التجريبية؟",
    run: resetActivityAnswers,
  },
  {
    title: "إعادة ضبط النقاط",
    desc: "يحذف كل نقاط الأطفال (يدوية، تسميع، نشاط).",
    confirm: "حذف كل النقاط التجريبية؟",
    run: resetPoints,
  },
  {
    title: "إعادة ضبط التحضير",
    desc: "يحذف تحضيرات الدروس المحفوظة على هذا الجهاز.",
    confirm: "حذف كل التحضيرات التجريبية؟",
    run: resetLessonPrep,
  },
  {
    title: "إعادة ضبط مهام الطلاب",
    desc: "يحذف مهام الطلاب التي أنشأها المعلم على هذا الجهاز.",
    confirm: "حذف كل مهام الطلاب التجريبية؟",
    run: resetStudentAssignments,
  },
  {
    title: "إعادة ضبط الإشعارات",
    desc: "يحذف الإشعارات المخزّنة على هذا الجهاز.",
    confirm: "حذف كل الإشعارات التجريبية؟",
    run: resetNotifications,
  },
  {
    title: "حذف التسجيلات التجريبية من هذا الجهاز",
    desc: "يحذف تسجيلات التسميع (صوت/فيديو) المحفوظة في متصفح هذا الجهاز فقط. لا يُحذف ضمن أي إعادة ضبط أخرى.",
    confirm: "حذف كل التسجيلات التجريبية من هذا الجهاز؟",
    runAsync: clearAllRecordings,
    danger: true,
  },
];

function ResetCard({ item }: { item: ResetItem }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (!window.confirm(item.confirm)) return;
    try {
      if (item.runAsync) {
        setBusy(true);
        await item.runAsync();
        setBusy(false);
      } else {
        item.run?.();
      }
      setMessage("تمت إعادة الضبط.");
    } catch {
      setBusy(false);
      setMessage("تعذّرت العملية على هذا الجهاز.");
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-card-title font-bold break-words">{item.title}</span>
        <span className="text-caption text-on-dark-muted break-words">{item.desc}</span>
      </div>
      <div className="sm:max-w-xs">
        <Button variant={item.danger ? "danger" : "secondary"} size="sm" fullWidth disabled={busy} onClick={handle}>
          {busy ? "جارٍ الحذف…" : "إعادة الضبط"}
        </Button>
      </div>
      {message && <p className="text-caption text-mint">{message}</p>}
    </Card>
  );
}

export function DemoTools() {
  return (
    <div className="flex flex-col gap-6">
      <Card variant="contrast" className="flex flex-col gap-1">
        <span className="text-card-title font-bold">أدوات إعادة الضبط</span>
        <span className="text-caption opacity-70">
          كل زر يمسح بياناته فقط على هذا الجهاز. لا يؤثر على بيانات الأطفال أو المستخدمين الثابتة.
        </span>
      </Card>

      <section className="flex flex-col gap-3">
        <SectionTitle title="بيانات التجربة" subtitle="إعادة ضبط آمنة ومنفصلة" />
        <div className="grid gap-4 lg:grid-cols-2">
          {ITEMS.map((item) => (
            <ResetCard key={item.title} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
