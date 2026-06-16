# Test Batch v2.1 — Soft 3D Cute + Color-Correct (Task B1.1 · color pass)

دفعة الاختبار 3D بعد **ضبط الألوان (color logic)**. لاعتماد الاتجاه فقط؛ لا تُركّب
في التطبيق قبل الموافقة.

- التوليد: **Higgsfield · Flux 2.0 (pro, 1k)** ثم **`remove_background`** للأصول
  الصغيرة → PNG شفاف مقصوص (بايبلاين `docs/TRANSPARENT_ASSET_PIPELINE.md`).
- **color logic مطبّق:** نجمة = ذهبي حيوي · صفحات الكتاب = أبيض صريح · القلب =
  كورال/أحمر دافئ · الوسام = ذهب واضح · علامة الموافقة = mint · بشرة المعلم =
  طبيعية والبنفسجي على العمامة/الرداء فقط · شبل الطفل = فرو طبيعي ذهبي والقبعة
  بنفسجية.
- حفظ الملفات داخل المستودع متعذّر من هذه البيئة (Higgsfield CDN محجوب 403)؛
  تُراجَع عبر الروابط/الـ job ids وتُنزَّل لاحقًا من بيئة بشبكة مفتوحة.

CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3E1uwg09F9UoCSTlAoXJKL9reW5/`

## الخلفية (مشهد كامل · غير شفافة · بلا تغيير لون)

| الملف | gen job | الرابط |
|---|---|---|
| `background_child_home.png` | `be496643-0e12-4f33-befc-a210d7e480c1` | `…/hf_20260616_084720_be496643-…​.png` |

## الأصول الصغيرة (color-corrected · transparent PNG)

| الملف النهائي | gen job | cutout job (transparent) | رابط الشفاف |
|---|---|---|---|
| `icon_recitation.png` | `aa2f3f55-…` | `9e8ac4e9-55fc-44c3-bab6-6f2fb91960ad` | `…/hf_20260616_090533_9e8ac4e9-…​.png` |
| `icon_points.png` (نجمة ذهبية) | `7a184096-…` | `afa386ba-256e-4dd7-88be-53d73917b1f1` | `…/hf_20260616_090534_afa386ba-…​.png` |
| `badge_recitation_master.png` | `7990d24b-…` | `c432b43e-4c52-4ad3-b5a4-9ac050e4e2ba` | `…/hf_20260616_090535_c432b43e-…​.png` |
| `badge_good_behavior.png` (قلب كورال) | `27b2c505-…` | `16580c85-4150-4365-89c8-9f158b0fc574` | `…/hf_20260616_090537_16580c85-…​.png` |
| `avatar_child_01.png` (شبل فرو طبيعي) | `043dc9f8-…` | `da11d21f-b58b-42dc-ae98-61a0de2f9af4` | `…/hf_20260616_090538_da11d21f-…​.png` |
| `avatar_teacher_01.png` (بشرة طبيعية) | `57cf2e89-…` | `822c6619-601d-4eca-a80e-66a9db51ef68` | `…/hf_20260616_090539_822c6619-…​.png` |
| `empty_tasks.png` | `c9a5062d-…` | `e6cc4a26-9a94-4304-a6c4-1326225c836c` | `…/hf_20260616_090541_e6cc4a26-…​.png` |
| `illustration_parent_approval.png` | `e3205f88-…` | `7c859df2-3a75-43fe-8299-24c5639de35a` | `…/hf_20260616_090542_7c859df2-…​.png` |

> النسخ الـ flat (v1) والنسخ 3D السابقة (v2 قبل ضبط اللون) متجاوَزة. هذه (v2.1) هي
> المرشحة للاعتماد.
