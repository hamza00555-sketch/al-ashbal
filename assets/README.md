# assets — الأشبال

أصول التطبيق البصرية. خطة الأصول الكاملة موثّقة في:

- `docs/VISUAL_ASSET_STYLE_LOCK.md` — الاتجاه البصري المقفول (Art Direction، الألوان، الأشكال، القواعد).
- `docs/ASSET_INVENTORY.md` — جرد كل الأصول + أسماء الملفات + الأولويات.
- `docs/HIGGSFIELD_PROMPT_PACK.md` — برومبتات التوليد الموحّدة + دفعة الاختبار.

## المجلدات

```
assets/
  visual-reference/   صور concept مرجعية لتثبيت الفايب (ليست UI نهائيًا)
  generated/
    backgrounds/      خلفيات (غير شفافة)
    icons/            أيقونات (PNG شفاف)
    badges/           أوسمة (PNG شفاف)
    avatars/          أفاتارات افتراضية (PNG شفاف)
    empty-states/     رسومات الحالات الفارغة (PNG شفاف)
    illustrations/    رسومات الميزات (PNG شفاف)
    test-batch/       دفعة الاختبار المبدئية (لاعتماد الاتجاه فقط)
```

## القاعدة

- لا تُركّب أي أصل داخل واجهة التطبيق قبل اعتماد الاتجاه (مهمة لاحقة).
- التسمية وفق Naming Convention في `docs/ASSET_INVENTORY.md`.
