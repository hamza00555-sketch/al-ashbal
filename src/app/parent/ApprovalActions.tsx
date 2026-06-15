"use client";

import { useState } from "react";
import { Badge, Button } from "@/components";

/**
 * Mock approval control. No real upload/back-end — clicking just reflects the
 * decision locally and labels it as a demo.
 */
export function ApprovalActions() {
  const [decision, setDecision] = useState<"approved" | "rerecord" | null>(null);

  if (decision) {
    return (
      <Badge tone={decision === "approved" ? "success" : "warning"}>
        {decision === "approved" ? "تمت الموافقة تجريبيًا" : "تم طلب إعادة التسجيل تجريبيًا"}
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" size="sm" onClick={() => setDecision("approved")}>
        موافقة
      </Button>
      <Button variant="danger" size="sm" onClick={() => setDecision("rerecord")}>
        إعادة التسجيل
      </Button>
    </div>
  );
}
