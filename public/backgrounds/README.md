# public/backgrounds — خلفيات التطبيق

ضع ملفات الخلفيات الست هنا بالأسماء التالية بالضبط. `AppShell` يستخدمها تلقائيًا
(صورة الجوال 9:16 و صورة الديسكتوب 16:9 عبر media query)، وإذا كان الملف غير
موجود **يرجع تلقائيًا للون/التدرج الحالي بلا أي كسر**.

| الملف المطلوب هنا | الاتجاه | المقاس |
|---|---|---|
| `background_ref_mobile.png` | 01 Reference Inspired | 1088×1920 (9:16) |
| `background_ref_desktop.png` | 01 Reference Inspired | 1920×1088 (16:9) |
| `background_abstract_mobile.png` | 02 Calm Abstract | 1088×1920 |
| `background_abstract_desktop.png` | 02 Calm Abstract | 1920×1088 |
| `background_journey_mobile.png` | 03 Learning Journey | 1088×1920 |
| `background_journey_desktop.png` | 03 Learning Journey | 1920×1088 |

## من أين تُنزَّل

الملفات مولّدة على Higgsfield (روابط + job ids كاملة في
`assets/generated/ASSET_MANIFEST.md`). بيئة التطوير هنا تحجب الشبكة بالكامل فلم
أستطع تنزيلها تلقائيًا؛ نزّلها من الروابط وضعها هنا بالأسماء أعلاه.

CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3E1uwg09F9UoCSTlAoXJKL9reW5/`

- ref_mobile → `hf_20260616_104601_149cf615-06fc-4829-b5b8-e2f9731a649c.png`
- ref_desktop → `hf_20260616_104604_a3c98b9a-8183-45ba-9a42-933e4c84ee67.png`
- abstract_mobile → `hf_20260616_104607_a1d3576f-f1b9-4245-9e73-40c2a1660355.png`
- abstract_desktop → `hf_20260616_104609_32d4b9c0-3d54-4ca0-ac72-9268c24c29db.png`
- journey_mobile → `hf_20260616_104612_8488936d-2247-4c9c-8aeb-624dd9f996da.png`
- journey_desktop → `hf_20260616_104615_d43a8e63-b42c-4f8c-bd6a-2bb98a0a32a7.png`

## كيف يُختار الاتجاه

`AppShell` يقبل `backgroundKey="abstract" | "ref" | "journey" | "none"`
(الافتراضي `abstract`). غيّره من الـ layout المناسب عند الرغبة.
