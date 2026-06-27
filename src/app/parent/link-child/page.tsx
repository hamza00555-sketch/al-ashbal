/*
  Parent · onboarding (/parent/link-child) — register parent, then add a child
  or link a self-registered child by the child's parent-link code.
  Parent ↔ Child linking (no halaqa code). Demo-only, localStorage.
*/
import { Card, PageHeader } from "@/components";
import { getParentContext } from "../_shared";
import { LinkChildPicker } from "./LinkChildPicker";

export default function ParentLinkChildPage() {
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader title="إضافة أو ربط طفل" subtitle="سجّل طفلك، أو اربط طفلًا سجّل بنفسه" />
      <Card>
        <p className="text-body text-on-dark-muted">
          يمكنك تسجيل طفلك الآن وستحصل على كود دخول تعطيه له، أو ربط طفل سجّل بنفسه
          باستخدام كود ربط الطفل. كل شيء تجريبي ومحفوظ على هذا الجهاز فقط.
        </p>
      </Card>
      <LinkChildPicker parentId={viewer.id} parentName={viewer.displayName} />
    </>
  );
}
