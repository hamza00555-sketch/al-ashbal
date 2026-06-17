/* Child wishes (/child/wishes) — privacy note + interactive (mock) wishes. */
import { AppAssetIcon, Card, PageHeader } from "@/components";
import { getWishesForViewer } from "@/lib/data";
import { IconSparkle } from "../_icons";
import { getChildContext } from "../_shared";
import { WishesSection } from "./WishesSection";

export default function ChildWishesPage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

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
