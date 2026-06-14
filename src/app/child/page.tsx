/*
  Child home (Phase 01 · Task 5) — /child.
  Server component. Reads ONLY the viewer-scoped accessors from the data layer,
  never the raw db, so a child can only ever see their own data.
  Mock phase: buttons are visual placeholders (no real lesson join / upload).
*/
import {
  AppShell,
  Avatar,
  Badge,
  type BadgeTone,
  Button,
  Card,
  MobileNav,
  type NavItem,
  PageHeader,
  ProgressBar,
  ProgressRing,
  SectionTitle,
} from "@/components";
import {
  getBadgesForChild,
  getMockUser,
  getNextLessonForChild,
  getProgressForChild,
  getRecitationsForViewer,
  getVisibleChildren,
  getWishesForViewer,
} from "@/lib/data";
import type { RecitationStatus } from "@/types";

/* — small inline icons (rounded line style, no new assets) — */
const iconBase = "size-full";
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={iconBase}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 0 4 20.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v15h6.5a1.5 1.5 0 0 1 1.5 1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={iconBase}>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={iconBase}>
      <path d="m12 3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={iconBase}>
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7c.6 2.4 2.6 4.4 5 5-2.4.6-4.4 2.6-5 5-.6-2.4-2.6-4.4-5-5 2.4-.6 4.4-2.6 5-5z" fill="currentColor" opacity=".35" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={iconBase}>
      <path d="M4 11 12 4l8 7M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={iconBase}>
      <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/child", icon: <IconHome /> },
  { id: "lessons", label: "الدروس", href: "#lessons", icon: <IconBook /> },
  { id: "progress", label: "تقدّمي", href: "#progress", icon: <IconStar /> },
  { id: "wishes", label: "أمنياتي", href: "#wishes", icon: <IconSparkle /> },
];

const RECITATION_STATUS: Record<RecitationStatus, { label: string; tone: BadgeTone }> = {
  recorded: { label: "جاهز للإرسال", tone: "purple" },
  pending_parent_approval: { label: "بانتظار موافقة ولي الأمر", tone: "warning" },
  parent_rejected: { label: "خلّينا نعيدها بشكل أوضح", tone: "danger" },
  pending_teacher_review: { label: "بانتظار تقييم المعلم", tone: "purple" },
  teacher_reviewed: { label: "تم التقييم", tone: "success" },
  deleted: { label: "محذوف", tone: "neutral" },
};

export default function ChildHomePage() {
  const viewer = getMockUser("child");
  const child = getVisibleChildren(viewer)[0] ?? null;

  const mobileNav = <MobileNav items={navItems} activeId="home" />;

  if (!child) {
    return (
      <AppShell mobileNav={mobileNav}>
        <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>
      </AppShell>
    );
  }

  const progress = getProgressForChild(viewer, child.id);
  const wishes = getWishesForViewer(viewer, child.id);
  const badge = getBadgesForChild(viewer, child.id)[0] ?? null;
  const nextLesson = getNextLessonForChild(viewer, child.id);
  const recitations = getRecitationsForViewer(viewer, child.id);
  const currentRecitation =
    recitations.find((r) => r.status !== "teacher_reviewed") ?? recitations[0] ?? null;

  return (
    <AppShell mobileNav={mobileNav}>
      <div className="mx-auto flex w-full max-w-md flex-col gap-lg">
        <PageHeader
          eyebrow="مرحباً"
          title={child.displayName}
          subtitle="جاهز لمهمة اليوم؟"
          leading={<Avatar name={child.displayName} size="lg" />}
          actions={
            <Button variant="ghost" size="sm" aria-label="التنبيهات">
              <span className="inline-flex size-5 items-center justify-center">
                <IconBell />
              </span>
            </Button>
          }
        />

        {/* 1) Mission today + join lesson */}
        <Card id="lessons" variant="gradient" className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <span className="text-caption text-on-dark-muted">مهمة اليوم</span>
            {nextLesson && <Badge tone="purple">اليوم</Badge>}
          </div>
          <h2 className="text-h2">{nextLesson?.title ?? "لا يوجد درس مجدول الآن"}</h2>
          {nextLesson?.quranSegment && (
            <p className="text-body text-on-dark-muted">القرآن: {nextLesson.quranSegment}</p>
          )}
          <div className="flex flex-wrap gap-xs">
            {nextLesson?.tajweedTopic && <Badge tone="neutral">تجويد: {nextLesson.tajweedTopic}</Badge>}
            {nextLesson?.behaviorTopic && <Badge tone="neutral">سلوك: {nextLesson.behaviorTopic}</Badge>}
          </div>
          <Button
            variant="primary"
            fullWidth
            disabled={!nextLesson}
            leadingIcon={<span className="inline-flex size-5"><IconBook /></span>}
          >
            ادخل الدرس
          </Button>
        </Card>

        {/* 2) Recitation task */}
        <Card className="flex flex-col gap-md">
          <SectionTitle title="مهمة التسميع" />
          {currentRecitation ? (
            <div className="flex items-center justify-between gap-md">
              <div className="flex flex-col gap-2xs">
                <span className="text-card-title font-bold">{currentRecitation.title}</span>
                <Badge tone={RECITATION_STATUS[currentRecitation.status].tone}>
                  {RECITATION_STATUS[currentRecitation.status].label}
                </Badge>
              </div>
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-3 text-purple-soft">
                <IconMic />
              </span>
            </div>
          ) : (
            <p className="text-body text-on-dark-muted">لا توجد مهمة تسميع الآن.</p>
          )}
          <Button
            variant="secondary"
            fullWidth
            leadingIcon={<span className="inline-flex size-5"><IconMic /></span>}
          >
            سجّل تسميعك
          </Button>
        </Card>

        {/* 3) Progress rings: Quran / Tajweed / Behavior */}
        <Card id="progress" className="flex flex-col gap-md">
          <SectionTitle title="تقدّمي" subtitle="القرآن · التجويد · السلوك" />
          <div className="flex items-center justify-around">
            <ProgressRing value={progress?.quranPercent ?? 0} tone="purple" sublabel="القرآن" />
            <ProgressRing value={progress?.tajweedPercent ?? 0} tone="gold" sublabel="التجويد" />
            <ProgressRing value={progress?.behaviorPercent ?? 0} tone="success" sublabel="السلوك" />
          </div>
        </Card>

        {/* 4) Badge of the day */}
        <Card variant="raised" className="flex items-center gap-md">
          <span className="gradient-badge inline-flex size-14 shrink-0 items-center justify-center rounded-pill p-3 text-on-light shadow-glow">
            <IconStar />
          </span>
          <div className="flex flex-col gap-2xs">
            <span className="text-caption text-on-dark-muted">وسام اليوم</span>
            <span className="text-card-title font-bold">{badge?.title ?? "لا يوجد وسام بعد"}</span>
            {badge && <span className="text-caption text-on-dark-muted">أحسنت، خطوة جميلة!</span>}
          </div>
        </Card>

        {/* 5) Cub journey progress bar */}
        <Card className="flex flex-col gap-sm">
          <SectionTitle title="رحلة الشبل" />
          <ProgressBar value={progress?.currentProgressBar.current ?? 0} tone="purple" />
          <p className="text-caption text-on-dark-muted">باقي القليل على الإنجاز القادم.</p>
        </Card>

        {/* 6) Wishes preview (private to the parent) */}
        <Card id="wishes" className="flex flex-col gap-sm">
          <SectionTitle title="أمنياتي" subtitle="تظهر لولي أمرك فقط" />
          {wishes.length > 0 ? (
            <ul className="flex flex-col gap-xs">
              {wishes.slice(0, 3).map((wish) => (
                <li key={wish.id} className="flex items-center gap-sm">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center text-purple-soft">
                    <IconSparkle />
                  </span>
                  <span className="text-body">{wish.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-on-dark-muted">اكتب أمنيتك، ولي أمرك يشوفها.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
