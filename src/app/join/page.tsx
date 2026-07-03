/*
  Join / family invitation entry (/join) — SUPABASE-BACKED (Phase 2).
  A parent opens the teacher's invitation link (?code=FAM-XXXXXXXX); the code
  is validated SERVER-SIDE against the database (portable across devices), and
  a valid one opens the family registration flow. Invalid/expired/revoked
  codes get clear Arabic messages. Public route (no AppShell).
  The old localStorage demo invitations no longer work here (by design).
*/
import Link from "next/link";
import { BackButton } from "@/components";
import { validateInvitationCode } from "@/lib/backend/invitations";
import { getCurrentUserProfile } from "@/lib/backend/auth";
import { FamilyJoinFlow } from "./FamilyJoinFlow";
import { JoinCodeEntry } from "./JoinCodeEntry";

export const dynamic = "force-dynamic";

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg p-6 text-center card-elevated text-on-dark">
      <span className="text-card-title font-bold">{title}</span>
      <p className="text-body text-on-light-muted">{body}</p>
      <Link href="/" className="text-caption font-bold text-purple underline-offset-4 hover:underline">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const cleanCode = (code ?? "").trim().toUpperCase();

  let content: React.ReactNode;
  if (!cleanCode) {
    content = <JoinCodeEntry />;
  } else {
    const info = await validateInvitationCode(cleanCode).catch(() => null);
    if (!info) {
      content = <StatusCard title="كود الدعوة غير صحيح" body="تأكد من الرابط أو الكود الذي وصلك من المعلمة، أو اطلب دعوة جديدة." />;
    } else if (info.status === "revoked") {
      content = <StatusCard title="تم إيقاف هذه الدعوة" body="تواصل مع المعلمة للحصول على دعوة جديدة." />;
    } else if (info.status === "expired") {
      content = <StatusCard title="انتهت صلاحية هذه الدعوة" body="اطلب من المعلمة إرسال دعوة جديدة." />;
    } else if (info.remaining_children < 1) {
      content = <StatusCard title="اكتمل عدد الأطفال لهذه الدعوة" body="تواصل مع المعلمة إن كنت بحاجة لإضافة أطفال آخرين." />;
    } else {
      // Session-aware: an already-signed-in PARENT just adds children.
      const profile = await getCurrentUserProfile().catch(() => null);
      const hasParentSession = profile?.role === "parent";
      content = (
        <FamilyJoinFlow
          code={cleanCode}
          remainingChildren={info.remaining_children}
          hasParentSession={hasParentSession}
          parentName={hasParentSession ? profile?.display_name : null}
        />
      );
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 size-72 rounded-pill bg-purple/20 blur-3xl lg:size-[26rem]"
      />
      <div className="relative flex w-full max-w-xl flex-col gap-6">
        <BackButton />
        <header className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="gradient-badge flex size-14 items-center justify-center rounded-pill text-h2 font-extrabold text-on-light shadow-glow">
            ش
          </Link>
          <h1 className="text-h1 font-extrabold text-cream">انضمام إلى الأشبال</h1>
          <p className="max-w-sm text-body text-cream/75">
            افتح دعوة المعلمة لتسجيل عائلتك وأطفالك.
          </p>
        </header>
        {content}
      </div>
    </main>
  );
}
