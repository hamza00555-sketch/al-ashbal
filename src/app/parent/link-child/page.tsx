/*
  Parent · link child (/parent/link-child) — enter the (single) halaqa code,
  then create a new child and link it to the halaqa. Demo-only, no backend.
*/
import { Card, PageHeader } from "@/components";
import { getParentContext } from "../_shared";
import { LinkChildPicker } from "./LinkChildPicker";

export default function ParentLinkChildPage() {
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader title="ربط طفل بالحَلَقة" subtitle="أدخل كود الحلقة ثم أنشئ طفلك" />
      <Card>
        <p className="text-body text-on-dark-muted">
          احصل على كود الحلقة من المعلّم، أدخله للتأكد من الحلقة، ثم أنشئ ملف طفلك واربطه بها.
          كل شيء تجريبي ومحفوظ على هذا الجهاز فقط.
        </p>
      </Card>
      <LinkChildPicker parentId={viewer.id} />
    </>
  );
}
