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
      <PageHeader title="ربط طفل" subtitle="اختر طفلًا للتجربة" />
      <Card>
        <p className="text-body text-on-dark-muted">
          اختر طفلًا للتجربة. في النسخة الحقيقية سيتم الربط بدعوة أو كود موافقة.
        </p>
      </Card>
      <LinkChildPicker parentId={viewer.id} />
    </>
  );
}
