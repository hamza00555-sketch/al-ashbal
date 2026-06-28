/*
  Child lessons (/child/lessons) — today's lesson details (compact cards from
  the teacher's prep) + the attendance gate as the big primary action.
  No student tasks here — those live in /child/tasks.
*/
"use client";

import { PageHeader } from "@/components";
import { useActiveChild } from "../ChildExperienceGate";
import { ChildLessonsView } from "./ChildLessonsView";

export default function ChildLessonsPage() {
  const child = useActiveChild();

  return (
    <>
      <PageHeader title="الدروس" subtitle="درس اليوم وحضور الحلقة" />
      <ChildLessonsView halaqaId={child.halaqaId} childId={child.id} />
    </>
  );
}
