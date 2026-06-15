/* Child wishes (/child/wishes) — list, privacy note, add (mock). */
import { Button, Card, PageHeader } from "@/components";
import { getWishesForViewer } from "@/lib/data";
import { IconSparkle } from "../_icons";
import { getChildContext } from "../_shared";

export default function ChildWishesPage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const wishes = getWishesForViewer(viewer, child.id);

  return (
    <>
      <PageHeader title="أمنياتي" subtitle="تظهر لولي أمرك فقط" />

      <Card className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2 text-purple-soft">
          <IconSparkle />
        </span>
        <p className="text-caption text-on-dark-muted">
          الأمنيات للتعبير، وليست وعدًا مباشرًا — يراها ولي أمرك فقط.
        </p>
      </Card>

      {wishes.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {wishes.map((wish) => (
            <Card key={wish.id} className="flex items-start gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center text-purple-soft">
                <IconSparkle />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-card-title font-bold break-words">{wish.title}</span>
                {wish.description && (
                  <span className="text-caption text-on-dark-muted break-words">{wish.description}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><p className="text-body text-on-dark-muted">اكتب أمنيتك، ولي أمرك يشوفها.</p></Card>
      )}

      <div className="lg:max-w-xs">
        <Button variant="primary" fullWidth leadingIcon={<span className="inline-flex size-5"><IconSparkle /></span>}>
          أضف أمنية
        </Button>
      </div>
    </>
  );
}
