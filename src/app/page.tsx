"use client";

/*
  Temporary component showcase (Phase 01 · Task 3).
  NOT a role page — it renders the core UI library once with placeholder props
  so the components and their variants are visible and verified. It will be
  replaced by the real landing / role pages in later tasks.
*/
import { useState } from "react";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  DesktopSidebar,
  MobileNav,
  PageHeader,
  ProgressBar,
  ProgressRing,
  RoleSwitcher,
  SectionTitle,
  StatCard,
  type NavItem,
  type RoleOption,
} from "@/components";

// A tiny placeholder glyph to demonstrate icon slots.
function Glyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { id: "home", label: "الرئيسية", icon: <Glyph /> },
  { id: "lessons", label: "الدروس", icon: <Glyph /> },
  { id: "progress", label: "تقدّمي", icon: <Glyph /> },
  { id: "wishes", label: "أمنياتي", icon: <Glyph /> },
];

const roles: RoleOption[] = [
  { id: "child", label: "الطفل" },
  { id: "parent", label: "ولي الأمر" },
  { id: "teacher", label: "المعلم" },
  { id: "guest", label: "ضيف الشرف" },
];

export default function ShowcasePage() {
  const [activeNav, setActiveNav] = useState("home");
  const [role, setRole] = useState("child");

  return (
    <AppShell
      sidebar={
        <DesktopSidebar
          items={navItems}
          activeId={activeNav}
          onSelect={setActiveNav}
          header={<span className="text-card-title font-extrabold text-on-dark">الأشبال</span>}
          footer={<RoleSwitcher roles={roles} current={role} onChange={setRole} />}
        />
      }
      mobileNav={<MobileNav items={navItems} activeId={activeNav} onSelect={setActiveNav} />}
      header={
        <PageHeader
          eyebrow="Phase 01 · Task 3"
          title="معرض المكوّنات"
          subtitle="مكتبة الواجهة الأساسية — بيانات تجريبية فقط"
          leading={<Avatar name="طلال محمد" size="lg" />}
          actions={<Button size="sm">إجراء</Button>}
        />
      }
    >
      <div className="flex flex-col gap-2xl">
        {/* Buttons */}
        <section className="flex flex-col gap-md">
          <SectionTitle title="الأزرار" subtitle="variants و أحجام" />
          <div className="flex flex-wrap items-center gap-sm">
            <Button variant="primary">رئيسي</Button>
            <Button variant="secondary">ثانوي</Button>
            <Button variant="ghost">شفّاف</Button>
            <Button variant="surface">سطح</Button>
            <Button variant="contrast">مميّز</Button>
            <Button variant="danger">خطر</Button>
            <Button size="lg" leadingIcon={<span className="size-4"><Glyph /></span>}>
              كبير
            </Button>
          </div>
        </section>

        {/* Badges */}
        <section className="flex flex-col gap-md">
          <SectionTitle title="الأوسمة والحالات" />
          <div className="flex flex-wrap items-center gap-sm">
            <Badge tone="gold">وسام المثابر</Badge>
            <Badge tone="success">حاضر</Badge>
            <Badge tone="warning">بانتظار</Badge>
            <Badge tone="danger">إعادة تسجيل</Badge>
            <Badge tone="purple">جديد</Badge>
            <Badge tone="neutral">عادي</Badge>
          </div>
        </section>

        {/* Progress */}
        <section className="flex flex-col gap-md">
          <SectionTitle title="التقدّم" />
          <div className="grid gap-lg md:grid-cols-2">
            <Card className="flex flex-col gap-md">
              <ProgressBar value={72} label="القرآن" />
              <ProgressBar value={48} tone="success" label="السلوك" />
              <ProgressBar value={90} tone="gold" label="التجويد" />
            </Card>
            <Card className="flex items-center justify-around">
              <ProgressRing value={72} tone="purple" sublabel="القرآن" />
              <ProgressRing value={90} tone="gold" sublabel="التجويد" />
              <ProgressRing value={48} tone="success" sublabel="السلوك" />
            </Card>
          </div>
        </section>

        {/* Cards & StatCards */}
        <section className="flex flex-col gap-md">
          <SectionTitle title="الكروت" subtitle="surface / raised / gradient / contrast" />
          <div className="grid gap-lg md:grid-cols-2">
            <StatCard label="الحضور" value="14 / 16" tone="success" icon={<Glyph />} hint="هذا الأسبوع" />
            <StatCard label="الأوسمة" value="23" tone="gold" icon={<Glyph />} />
            <Card variant="gradient">
              <h3 className="text-card-title font-bold">مهمة اليوم</h3>
              <p className="text-body text-on-dark-muted">كرت بتدرّج بنفسجي.</p>
            </Card>
            <Card variant="contrast">
              <h3 className="text-card-title font-bold">ملاحظة خصوصية</h3>
              <p className="text-body opacity-80">كرت فاتح محدود الاستخدام.</p>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
