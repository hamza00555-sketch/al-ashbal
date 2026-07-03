/* Instant feedback for /parent/* (dynamic segment — per-request auth). */
import { RouteLoading } from "@/components/ui/RouteLoading";

export default function ParentLoading() {
  return <RouteLoading label="جاري فتح لوحة ولي الأمر..." />;
}
