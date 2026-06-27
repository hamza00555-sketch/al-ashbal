/*
  Child · onboarding (/child/start) — student self-registration (with a
  parent-link code to share), or entering a parent-provided access code to open
  the child's profile. Demo-only, localStorage. No real login.
*/
import { PageHeader } from "@/components";
import { StudentOnboarding } from "./StudentOnboarding";

export default function ChildStartPage() {
  return (
    <>
      <PageHeader title="تسجيل الطالب" subtitle="سجّل نفسك، أو ادخل بكود من ولي أمرك" />
      <StudentOnboarding />
    </>
  );
}
