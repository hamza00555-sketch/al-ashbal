"use client";

import Link from "next/link";
import { Button, Card } from "@/components";
import { IconVideo } from "./_icons";
import { useTeacherReviewCount } from "./useReviewCount";

/**
 * Small alert card on the teacher home: shows how many recitations await review
 * (db pending + parent-approved demo submissions). Hidden entirely when zero.
 */
export function TeacherReviewAlert({
  teacherId,
  dbPendingReviews,
}: {
  teacherId: string;
  dbPendingReviews: number;
}) {
  const count = useTeacherReviewCount(teacherId, dbPendingReviews);
  if (count === 0) return null;

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple-soft">
          <IconVideo />
        </span>
        <p className="text-body font-bold break-words">
          هناك {count} تسميع بانتظار المراجعة
        </p>
      </div>
      <Link href="/teacher/reviews">
        <Button variant="primary" size="sm">اذهب للمراجعات</Button>
      </Link>
    </Card>
  );
}
