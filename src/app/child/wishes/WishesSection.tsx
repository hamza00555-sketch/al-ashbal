"use client";

import { useState } from "react";
import { AppAssetIcon, Button, Card, CardOverlayMotif, Modal } from "@/components";
import { IconSparkle } from "../_icons";

export interface LocalWish {
  id: string;
  title: string;
  description?: string;
}

/**
 * Wishes list + add form (mock). New wishes are kept in local state only —
 * nothing is written to the mock db or any backend.
 */
export function WishesSection({ initialWishes }: { initialWishes: LocalWish[] }) {
  const [wishes, setWishes] = useState<LocalWish[]>(initialWishes);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setWishes((prev) => [
      { id: `local-${Date.now()}`, title: trimmed, description: note.trim() || undefined },
      ...prev,
    ]);
    setTitle("");
    setNote("");
    setOpen(false);
  }

  const inputClass =
    "min-h-11 rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";

  return (
    <>
      {/* Read-only display cards (no clickable affordance). */}
      {wishes.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {wishes.map((wish) => (
            <Card key={wish.id} variant="contrast" className="relative isolate flex items-start gap-3 overflow-hidden">
              <CardOverlayMotif motif="wishes" className="-bottom-4 -end-4 size-24 text-gold opacity-[0.12]" />
              <AppAssetIcon src="/assets/icons/icon_wishes.png" size="md" className="relative z-10 text-purple" fallback={<IconSparkle />} />
              <div className="relative z-10 flex min-w-0 flex-col gap-1">
                <span className="text-card-title font-bold break-words">{wish.title}</span>
                {wish.description && (
                  <span className="text-caption break-words text-[#5F4B7A]">{wish.description}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><p className="text-body text-on-dark-muted">اكتب أمنيتك، ولي أمرك يشوفها.</p></Card>
      )}

      <div className="lg:max-w-xs">
        <Button
          variant="primary"
          fullWidth
          onClick={() => setOpen(true)}
          leadingIcon={<span className="inline-flex size-5"><IconSparkle /></span>}
        >
          أضف أمنية
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="أضف أمنية">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-caption text-on-dark-muted">اسم الأمنية</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="مثال: كتاب جديد"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-caption text-on-dark-muted">ملاحظة قصيرة (اختياري)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </label>
          <p className="text-caption text-on-dark-muted">تجربة مؤقتة — لا يتم الحفظ الآن.</p>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" fullWidth>حفظ</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
