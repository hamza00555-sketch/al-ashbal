/* Instant feedback for ALL /teacher/* navigations (the segment is dynamic:
   per-request auth in the layout takes real time — see the latency audit). */
import { RouteLoading } from "@/components/ui/RouteLoading";

export default function TeacherLoading() {
  return <RouteLoading label="جاري فتح أدوات المعلم..." />;
}
