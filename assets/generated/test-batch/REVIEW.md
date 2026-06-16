# Test Batch v2 — Soft 3D Cute (Task B1.1)

دفعة اختبار **جديدة بالستايل 3D اللطيف** — تستبدل دفعة v1 الـ flat (ملغاة بصريًا).
لاعتماد الاتجاه فقط؛ لا تُركّب في التطبيق قبل موافقتك.

- التوليد: **Higgsfield · Flux 2.0 (pro, 1k)** للستايل soft 3D.
- الشفافية: الأصول الصغيرة مرّت على **`remove_background`** آليًا → **PNG شفاف
  مقصوص** (بايبلاين `docs/TRANSPARENT_ASSET_PIPELINE.md`). الخلفية تبقى كاملة.
- حفظ الملفات داخل المستودع متعذّر من هذه البيئة: نطاق Higgsfield CDN محجوب
  (HTTP 403). تُراجَع عبر الروابط/الـ job ids أدناه، وتُنزَّل لاحقًا من بيئة بها
  وصول شبكي إلى مجلداتها في `assets/generated/`.

CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3E1uwg09F9UoCSTlAoXJKL9reW5/`

## الخلفية (مشهد كامل · غير شفافة)

| الملف | gen job | الرابط |
|---|---|---|
| `background_child_home.png` | `be496643-0e12-4f33-befc-a210d7e480c1` | `…/hf_20260616_084720_be496643-…​.png` |

## الأصول الصغيرة (transparent PNG بعد القص)

لكل أصل: **gen job** (الرندر 3D على خلفية سادة) ثم **cutout job** (الشفاف النهائي).

| الملف النهائي | gen job | cutout job (transparent) | رابط الشفاف |
|---|---|---|---|
| `icon_recitation.png` | `25b362c0-…` | `ad9330f9-a269-4471-a991-4f291deacfc1` | `…/hf_20260616_084807_ad9330f9-…​.png` |
| `icon_points.png` | `ec9e1cac-…` | `6f222ed3-387d-422e-a22c-60e6cb735384` | `…/hf_20260616_084808_6f222ed3-…​.png` |
| `badge_recitation_master.png` | `f7f0a46d-…` | `6354efa1-c46f-4190-b80b-3097659e9684` | `…/hf_20260616_084809_6354efa1-…​.png` |
| `badge_good_behavior.png` | `7781c71e-…` | `c72c40e7-6e42-444e-9a0b-b05d2c76463b` | `…/hf_20260616_084810_c72c40e7-…​.png` |
| `avatar_child_01.png` | `b51cbbd6-…` | `2a3fc197-05bb-473e-95b6-2dace679c93b` | `…/hf_20260616_084812_2a3fc197-…​.png` |
| `avatar_teacher_01.png` | `6334a982-…` | `3c31e74e-502c-4724-9310-cb1960c27067` | `…/hf_20260616_084813_3c31e74e-…​.png` |
| `empty_tasks.png` | `6521ddef-…` | `431f7bcb-9183-4016-93ec-9563b0518925` | `…/hf_20260616_084815_431f7bcb-…​.png` |
| `illustration_parent_approval.png` | `34a41849-…` | `5d751488-e92e-4e9a-9787-ac7143ed670c` | `…/hf_20260616_084816_5d751488-…​.png` |

> QA قبل الاعتماد (لكل أصل): يُفهم خلال ثانيتين، نفس عائلة 3D، خلفية شفافة فعلًا
> وحواف نظيفة بلا هالة، بلا نص/وجوه واقعية، مقروء عند الحجم الصغير.
