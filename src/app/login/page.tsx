/*
  Unified login (/login) — the ONE public sign-in entry for approved accounts.
  Server pre-check: an already-signed-in teacher/parent is sent straight to
  their area; everyone else gets the form. Standalone branded screen.
*/
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackButton } from "@/components";
import { getCurrentUserProfile } from "@/lib/backend/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getCurrentUserProfile().catch(() => null);
  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");
  if (profile?.role === "parent") redirect("/parent");

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
          <h1 className="text-h1 font-extrabold text-cream">تسجيل الدخول</h1>
          <p className="max-w-sm text-body text-cream/75">
            للمعلم ولولي الأمر المعتمدين. جديد هنا؟{" "}
            <Link href="/join/request" className="font-bold text-cream underline-offset-4 hover:underline">
              أرسل طلب انضمام
            </Link>
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
