"use client";

import { useState } from "react";
import { AppAssetIcon, Badge, Button, Card, SectionTitle } from "@/components";
import {
  addMaterial,
  archiveMaterial,
  MATERIAL_TYPE_LABEL,
  moveMaterialDown,
  moveMaterialUp,
  restoreMaterial,
  setMaterialVisibility,
  updateMaterial,
  useAllMaterialsForHalaqa,
  type LearningMaterial,
  type MaterialType,
} from "@/lib/demo/materials";
import { IconBook } from "../_icons";
import { MaterialLessons } from "./MaterialLessons";

const inputClass =
  "min-h-11 w-full rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";

const TYPE_OPTIONS = Object.keys(MATERIAL_TYPE_LABEL) as MaterialType[];

const SWATCH: Record<LearningMaterial["colorToken"], string> = {
  purple: "bg-purple",
  gold: "bg-gold",
  success: "bg-[#2FBF78]",
};

/** Inline edit form for a single material. */
function EditRow({ halaqaId, material, onDone }: { halaqaId: string; material: LearningMaterial; onDone: () => void }) {
  const [name, setName] = useState(material.name);
  const [type, setType] = useState<MaterialType>(material.type);
  const [targetPoints, setTargetPoints] = useState(String(material.targetPoints));
  const [show, setShow] = useState(material.showInChildProgress);

  function save() {
    updateMaterial(halaqaId, material.id, {
      name,
      type,
      targetPoints: Number(targetPoints),
      showInChildProgress: show,
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-3 rounded-md bg-surface-raised p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>اسم المادة</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>النوع</span>
          <select value={type} onChange={(e) => setType(e.target.value as MaterialType)} className={inputClass}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{MATERIAL_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>هدف النقاط</span>
          <input type="number" min={1} value={targetPoints} onChange={(e) => setTargetPoints(e.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 accent-purple" />
          <span className="text-body text-on-dark">تظهر في تقدّم الطفل</span>
        </label>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={save}>حفظ</Button>
        <Button variant="ghost" size="sm" onClick={onDone}>إلغاء</Button>
      </div>
    </div>
  );
}

export function MaterialsManager({ halaqaId }: { halaqaId: string }) {
  const materials = useAllMaterialsForHalaqa(halaqaId);
  const active = materials.filter((m) => !m.archived);
  const archived = materials.filter((m) => m.archived);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [lessonsOpenId, setLessonsOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // add-form state
  const [name, setName] = useState("");
  const [type, setType] = useState<MaterialType>("custom");
  const [targetPoints, setTargetPoints] = useState("20");
  const [show, setShow] = useState(true);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("اكتب اسم المادة.");
      return;
    }
    addMaterial(halaqaId, { name, type, targetPoints: Number(targetPoints), showInChildProgress: show });
    setMessage("تمت إضافة المادة.");
    setName("");
    setType("custom");
    setTargetPoints("20");
    setShow(true);
  }

  function renderCard(m: LearningMaterial, index: number, list: LearningMaterial[]) {
    if (editingId === m.id) {
      return (
        <Card key={m.id} className="flex flex-col gap-2">
          <EditRow halaqaId={halaqaId} material={m} onDone={() => setEditingId(null)} />
        </Card>
      );
    }
    return (
      <Card key={m.id} className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <AppAssetIcon src={`/assets/icons/${m.iconKey}.png`} size="md" className="rounded-full bg-purple/15 text-purple-soft" fallback={<IconBook />} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`inline-block size-3 shrink-0 rounded-full ${SWATCH[m.colorToken]}`} aria-hidden />
              <span className="text-card-title font-bold break-words">{m.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="purple">{MATERIAL_TYPE_LABEL[m.type]}</Badge>
              <Badge tone="neutral">هدف النقاط: {m.targetPoints}</Badge>
              <Badge tone={m.showInChildProgress ? "success" : "neutral"}>
                {m.showInChildProgress ? "تظهر في التقدّم" : "مخفية من التقدّم"}
              </Badge>
              <Badge tone="neutral">الترتيب: {m.order}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditingId(m.id)}>تعديل</Button>
          <Button variant="ghost" size="sm" onClick={() => setMaterialVisibility(halaqaId, m.id, !m.showInChildProgress)}>
            {m.showInChildProgress ? "إخفاء من التقدّم" : "إظهار في التقدّم"}
          </Button>
          <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveMaterialUp(halaqaId, m.id)}>رفع الترتيب</Button>
          <Button variant="ghost" size="sm" disabled={index === list.length - 1} onClick={() => moveMaterialDown(halaqaId, m.id)}>خفض الترتيب</Button>
          <Button variant="ghost" size="sm" onClick={() => archiveMaterial(halaqaId, m.id)}>أرشفة</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLessonsOpenId((cur) => (cur === m.id ? null : m.id))}
          >
            {lessonsOpenId === m.id ? "إخفاء الدروس" : "إدارة الدروس"}
          </Button>
        </div>
        {lessonsOpenId === m.id && <MaterialLessons materialId={m.id} />}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Add a new material */}
      <Card className="flex flex-col gap-4">
        <SectionTitle title="إضافة مادة" subtitle="تظهر كدائرة تقدّم لدى الطفل" />
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>اسم المادة</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: الحديث" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>النوع</span>
              <select value={type} onChange={(e) => setType(e.target.value as MaterialType)} className={inputClass}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{MATERIAL_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>هدف النقاط</span>
              <input type="number" min={1} value={targetPoints} onChange={(e) => setTargetPoints(e.target.value)} className={inputClass} />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 accent-purple" />
              <span className="text-body text-on-dark">تظهر في تقدّم الطفل</span>
            </label>
          </div>
          <div className="sm:max-w-xs">
            <Button type="submit" variant="primary" fullWidth>إضافة مادة</Button>
          </div>
          {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        </form>
      </Card>

      {/* Active materials */}
      <section className="flex flex-col gap-3">
        <SectionTitle title="المواد الحالية" subtitle="مصدر دوائر تقدّم الطفل" />
        {active.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {active.map((m, i) => renderCard(m, i, active))}
          </div>
        ) : (
          <Card><p className="text-body text-on-dark-muted">لا مواد نشطة — أضِف أول مادة.</p></Card>
        )}
      </section>

      {/* Archived materials */}
      {archived.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle title="مواد مؤرشفة" subtitle="لا تظهر للطفل — محفوظة هنا" />
          <div className="grid gap-3 lg:grid-cols-2">
            {archived.map((m) => (
              <Card key={m.id} className="flex items-center justify-between gap-3">
                <span className="text-card-title font-bold break-words">{m.name}</span>
                <Button variant="secondary" size="sm" onClick={() => restoreMaterial(halaqaId, m.id)}>استعادة</Button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
