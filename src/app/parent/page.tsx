/*
  Parent overview (/parent) — "أطفالي": only the children the parent has
  explicitly linked (local demo links), plus a pending-approvals alert.
  A parent never enters the child app from here.
*/
import { PageHeader, RoleAvatar, RoleName, SettingsLink } from "@/components";
import { ParentLinkedChildren } from "./ParentLinkedChildren";
import { ParentPendingAlert } from "./ParentPendingAlert";
import { getParentContext } from "./_shared";

export default function ParentOverviewPage() {
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader
        eyebrow="أهلاً"
        title={<RoleName role="parent" fallback={viewer.displayName} />}
        subtitle="متابعة أبنائك باطمئنان"
        leading={<RoleAvatar role="parent" fallbackName={viewer.displayName} fallbackSrc="/assets/avatars/avatar_parent_father_01.png" />}
        actions={<SettingsLink role="parent" />}
      />

      <ParentPendingAlert parentUserId={viewer.id} />
      <ParentLinkedChildren parentId={viewer.id} />
    </>
  );
}
