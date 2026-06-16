/*
  Teacher · demo tools (/teacher/demo-tools) — Phase 01 · Task A7.
  Safe, separated reset buttons for the demo stores (localStorage + the
  IndexedDB recordings). Never touches the static mock db / children / users.
*/
import { PageHeader } from "@/components";
import { DemoTools } from "./DemoTools";

export default function TeacherDemoToolsPage() {
  return (
    <>
      <PageHeader title="أدوات التجربة" subtitle="إعادة ضبط بيانات الديمو على هذا الجهاز" />
      <DemoTools />
    </>
  );
}
