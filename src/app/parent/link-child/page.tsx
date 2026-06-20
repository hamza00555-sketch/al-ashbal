/*
  Parent · link child (/parent/link-child) — explicit, demo-only manual linking
  of a child to the parent account. No backend.
*/
import { Card, PageHeader } from "@/components";
import { getParentContext } from "../_shared";
import { LinkChildPicker } from "./LinkChildPicker";

export default function ParentLinkChildPage() {
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader title="ربط طفل بالحَلَقة" subtitle="أدخل كود الحلقة ثم اختر الطفل" />
      <Card>
        <p className="text-body text-on-dark-muted">
          احصل على كود الحلقة من المعلّم، أدخله للتأكد من الحلقة، ثم اربط طفلك بها.
          الربط تجريبي ومحفوظ على هذا الجهاز فقط.
        </p>
      </Card>
      <LinkChildPicker parentId={viewer.id} />
    </>
  );
}
