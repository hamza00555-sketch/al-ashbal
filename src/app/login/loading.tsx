/* Instant feedback for /login (dynamic: server session pre-check). */
import { RouteLoading } from "@/components/ui/RouteLoading";

export default function LoginLoading() {
  return <RouteLoading label="جاري التحميل..." />;
}
