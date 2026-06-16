# public/assets — أصول الواجهة (drop-in)

ضع ملفات PNG **الشفافة** هنا بالأسماء الموثّقة في
`docs/ASSET_PRODUCTION_MANIFEST.md`. كل أصل مربوط في التطبيق عبر مكوّن **fallback
آمن** (`AssetImage`): إذا لم يوجد الملف يظهر البديل الحالي (SVG / initials / نص /
pill ذهبي) بلا أي كسر؛ وبمجرد إضافة الملف يُستبدل تلقائيًا.

```
public/assets/
  avatars/        avatar_child_boy_01.png ...      (شفاف · مواجه للكاميرا)
  badges/         badge_recitation.png ...         (شفاف · ميدالية 3D)
  icons/          icon_home.png ...                (شفاف · أيقونة 3D مركزية)
  illustrations/  illustration_no_tasks.png ...    (شفاف · مشهد مصغّر)
```

- الستايل والقواعد: `docs/VISUAL_ASSET_STYLE_LOCK.md` (cute soft 3D · front-facing
  · بلا تركوازي/منت · بشرة طبيعية · زي حضرمي · purple/gold/cream).
- برومبتات التوليد لكل أصل: `docs/HIGGSFIELD_PROMPT_PACK.md` (Batch 02).
- التوليد عبر Higgsfield + قص الخلفية تلقائيًا (transparent) قبل الوضع هنا.
- الخلفيات (full-screen) ليست هنا — مكانها `public/backgrounds/`.
