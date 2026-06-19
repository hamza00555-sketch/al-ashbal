/*
  Parent approvals (/parent/approvals) — driven entirely by the live recordings
  submissions store: pending (awaiting parent) on top, an empty-state when none,
  and processed (approved / sent back) at the bottom. No stale seed list, so an
  item never stays "pending" after approval.
*/
import { PageHeader } from "@/components";
import { getParentContext } from "../_shared";
import { ParentApprovalsEmpty } from "./ParentApprovalsEmpty";
import { ParentSubmissions } from "./ParentSubmissions";

export default async function ParentApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader title="الموافقات" subtitle="الفيديو لا يصل للمعلم إلا بعد موافقتك" />

      <ParentSubmissions parentUserId={viewer.id} highlightSubmissionId={submissionId} />
      <ParentApprovalsEmpty parentUserId={viewer.id} />

      {/* Processed (approved / sent back) move to the bottom — they don't vanish. */}
      <ParentSubmissions parentUserId={viewer.id} mode="processed" />
    </>
  );
}
