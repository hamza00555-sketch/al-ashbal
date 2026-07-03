/*
  /teacher/login — kept for compatibility (old links/bookmarks). The unified
  login now lives at /login, which routes each approved role to its area.
  (A signed-in teacher hitting this path is bounced to /teacher by the proxy.)
*/
import { redirect } from "next/navigation";

export default function TeacherLoginPage() {
  redirect("/login");
}
