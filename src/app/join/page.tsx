/*
  Join / invitation entry (/join) — a parent or student opens a teacher's
  invitation link (?code=...) and is routed to the correct registration flow
  (family or student). With no code, an invitation-code input is shown.
  Public route (no AppShell). Demo-only, localStorage.
*/
import Link from "next/link";
import { BackButton } from "@/components";
import { JoinFlow } from "./JoinFlow";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; demoInvite?: string }>;
}) {
  const { code, demoInvite } = await searchParams;

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-5 py-10">
      {/* soft brand glow */}
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
            افتح دعوة المعلم لتسجيل عائلتك أو تسجيل الطالب.
          </p>
        </header>

        <JoinFlow initialCode={code} initialDemoInvite={demoInvite} />
      </div>
    </main>
  );
}
