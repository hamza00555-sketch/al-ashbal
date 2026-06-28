/* Child wishes (/child/wishes) — privacy note + interactive (mock) wishes.
   Uses the ACTIVE child on this shared family device (see ChildExperienceGate). */
"use client";

import { AppAssetIcon, Card, PageHeader } from "@/components";
import { getMockUser, getWishesForViewer } from "@/lib/data";
import { IconSparkle } from "../_icons";
import { useActiveChild } from "../ChildExperienceGate";
import { WishesSection } from "./WishesSection";

export default function ChildWishesPage() {
  const viewer = getMockUser("child");
  const child = useActiveChild();

  const wishes = getWishesForViewer(viewer, child.id).map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
  }));

  return (
    <>
      <PageHeader title="أمنياتي" subtitle="تظهر لولي أمرك فقط" />

      <Card className="flex items-center gap-3">
        <AppAssetIcon
          src="/assets/icons/icon_wishes.png"
          size="md"
          className="rounded-full bg-purple/15 text-purple-soft"
          fallback={<IconSparkle />}
        />
        <p className="text-caption text-on-dark-muted">
          الأمنيات للتعبير، وليست وعدًا مباشرًا — يراها ولي أمرك فقط.
        </p>
      </Card>

      <WishesSection initialWishes={wishes} />
    </>
  );
}
