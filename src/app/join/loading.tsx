/* Instant feedback for /join (dynamic: reads the invitation searchParams).
   NOTE: /join/request is a STATIC route — it renders instantly and a
   loading state would never be shown, so it deliberately has none. */
import { RouteLoading } from "@/components/ui/RouteLoading";

export default function JoinLoading() {
  return <RouteLoading label="جاري تجهيز الصفحة..." />;
}
