/*
  Public join-request page (/join/request) — controlled onboarding.
  Anyone may REQUEST access (teacher / parent); an approved teacher reviews the
  request from /teacher/join-requests. Submitting grants NO access by itself.
  Separate from the local demo invitation flow at /join (unchanged).
*/
import Link from "next/link";
import { BackButton } from "@/components";
import { JoinRequestForm } from "./JoinRequestForm";

export default function JoinRequestPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 size-72 rounded-pill bg-purple/20 blur-3xl lg:size-[26rem]"
      />
      <div className="relative flex w-full max-w-md flex-col gap-6">
        <BackButton />
        <header className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="gradient-badge flex size-14 items-center justify-center rounded-pill text-h2 font-extrabold text-on-light shadow-glow">
            ش
          </Link>
          <h1 className="text-h1 font-extrabold text-cream">طلب انضمام</h1>
          <p className="max-w-sm text-body text-cream/75">
            أرسل طلبك، وسيتم مراجعته من المعلمة قبل تفعيل الحساب.
          </p>
        </header>

        <JoinRequestForm />
      </div>
    </main>
  );
}
