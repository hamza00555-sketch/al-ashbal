/*
  Guest overview (Phase 01 · Task 8) — /guest.
  A calm, presentation-style page for the honored guest. Uses getMockUser("guest")
  and ONLY getGuestSummary, which returns anonymous group aggregates — never
  names, videos, wishes, or individual notes. No raw db.
*/
import {
  AppShell,
  Avatar,
  Badge,
  Card,
  DemoExperienceSwitcher,
  NotificationBell,
  PageHeader,
  ProgressRing,
  SectionTitle,
  StatCard,
} from "@/components";
import { getGuestSummary, getMockUser, getNotificationsForViewer } from "@/lib/data";
import { GuestLessonEntry } from "./GuestLessonEntry";
import { IconBadge, IconCalendar, IconHalaqa, IconUsers } from "./_icons";

const chip = "inline-flex size-6 items-center justify-center";

export default function GuestOverviewPage() {
  const viewer = getMockUser("guest");
  const summary = getGuestSummary(viewer);
  const notifications = getNotificationsForViewer(viewer);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher current="guest" />
          <NotificationBell notifications={notifications} />
        </div>

        <PageHeader
          eyebrow="عرض عام"
          title="ضيف الشرف"
          subtitle="لمحة مشرّفة عن إنجازات الأشبال"
          leading={<Avatar name="ضيف الشرف" size="lg" />}
        />

        {/* Privacy notice */}
        <Card variant="contrast" className="flex flex-col gap-1">
          <h2 className="text-card-title font-bold">صفحة عرض عامة</h2>
          <p className="text-body opacity-80">
            هذه صفحة عرض عامة لا تعرض بيانات الأطفال الشخصية.
          </p>
        </Card>

        <GuestLessonEntry />

        {summary ? (
          <>
            {/* General stats */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="الحلقات" value={summary.halaqaCount} tone="purple" icon={<span className={chip}><IconHalaqa /></span>} />
              <StatCard label="الأشبال" value={summary.totalChildren} tone="purple" icon={<span className={chip}><IconUsers /></span>} />
              <StatCard label="نسبة الحضور العامة" value={`${summary.attendancePercent}%`} tone="success" icon={<span className={chip}><IconCalendar /></span>} />
              <StatCard label="الأوسمة" value={summary.badgesAwarded} tone="gold" icon={<span className={chip}><IconBadge /></span>} />
            </div>

            {/* Group progress averages */}
            <Card className="flex flex-col gap-4">
              <SectionTitle title="ملخص التقدّم العام" subtitle="متوسطات مجهولة للمجموعة" />
              <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
                <ProgressRing value={summary.avgQuran} size={84} strokeWidth={9} tone="purple" sublabel="القرآن" />
                <ProgressRing value={summary.avgTajweed} size={84} strokeWidth={9} tone="gold" sublabel="التجويد" />
                <ProgressRing value={summary.avgBehavior} size={84} strokeWidth={9} tone="success" sublabel="السلوك" />
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Today snapshot */}
              <Card className="flex flex-col gap-4">
                <SectionTitle title="لمحة عن نشاط اليوم" />
                <div className="flex flex-wrap gap-2">
                  <Badge tone="purple">حلقات اليوم: {summary.lessonsToday}</Badge>
                  <Badge tone="success">حاضرون: {summary.present}</Badge>
                  <Badge tone="warning">متأخرون: {summary.late}</Badge>
                  <Badge tone="danger">غائبون: {summary.absent}</Badge>
                </div>
              </Card>

              {/* General achievements (anonymous) */}
              <Card className="flex flex-col gap-3">
                <SectionTitle title="إنجازات عامة" />
                <ul className="flex flex-col gap-2 text-body">
                  <li className="flex items-center gap-2">
                    <span className="inline-block size-2 shrink-0 rounded-pill bg-purple-soft" /> تم إكمال {summary.lessonsCompleted} حلقة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block size-2 shrink-0 rounded-pill bg-mint" /> تم اعتماد {summary.recitationsReviewed} تسميع
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block size-2 shrink-0 rounded-pill bg-gold" /> تم منح {summary.badgesAwarded} وسام
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block size-2 shrink-0 rounded-pill bg-purple-soft" /> تقدّم جماعي {summary.groupProgressPercent}%
                  </li>
                </ul>
                <p className="text-caption text-on-dark-muted">أرقام مجمّعة بدون أي أسماء أو بيانات فردية.</p>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <p className="text-body text-on-dark-muted">لا تتوفر بيانات العرض حاليًا.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
