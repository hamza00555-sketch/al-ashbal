/*
  Child profile switcher (/child/switch) — the shared-family-device picker
  «من يستخدم التطبيق الآن؟». Picking a child sets the active profile and opens
  /child. A family-device profile switcher, not an account login.
*/
import { PageHeader } from "@/components";
import { ChildPicker } from "../ChildPicker";

export default function ChildSwitchPage() {
  return (
    <>
      <PageHeader title="من يستخدم التطبيق الآن؟" subtitle="اختر الطفل قبل بدء المهمة" />
      <ChildPicker redirectTo="/child" />
    </>
  );
}
