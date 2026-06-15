"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components";

/**
 * Temporary class activity card (shown on /child only when an activity is
 * active). Mock — starting it just shows a demo message.
 */
export function ActivityCard({ title, description }: { title: string; description: string }) {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Card variant="gradient" className="flex flex-col gap-3">
      <span>
        <Badge tone="success">نشاط مفتوح الآن</Badge>
      </span>
      <h2 className="text-h2 break-words">{title}</h2>
      <p className="text-body text-on-dark-muted break-words">{description}</p>
      <div className="lg:max-w-xs">
        <Button variant="primary" fullWidth onClick={() => setMessage("النشاط التجريبي غير مفعّل الآن.")}>
          ابدأ النشاط
        </Button>
      </div>
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
    </Card>
  );
}
