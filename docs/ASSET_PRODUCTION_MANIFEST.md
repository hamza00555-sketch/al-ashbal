# ASSET PRODUCTION MANIFEST — Batch 02 (Core UI Assets)

أصول الواجهة (avatars · badges · icons · illustrations). كلها **transparent PNG**
بأسلوب **cute soft 3D · front-facing** وقواعد `docs/VISUAL_ASSET_STYLE_LOCK.md`.
برومبت كل أصل في `docs/HIGGSFIELD_PROMPT_PACK.md` (Batch 02).

- **prompt:** `ready` = برومبت جاهز · **file:** `pending` = الـ PNG لم يُضف بعد.
- **wired:** هل رُبط في التطبيق بـ fallback آمن الآن؟

> ✅ **تحديث:** الـ30 أصلًا وُلّدت كلها عبر Higgsfield وقُصّت خلفياتها (PNG شفاف).
> روابط التنزيل في `public/assets/DOWNLOAD_LINKS.md`، أو نفّذ
> `bash scripts/download-assets.sh` لجلبها كلها إلى مجلداتها مرة واحدة.
> (`file: pending` أدناه تعني فقط أنها لم تُحفظ محليًا داخل المستودع بعد.)

مسار الوضع: `public/assets/<category>/<file>.png`. البديل الآمن مذكور لكل نوع.

---

## A. Avatars  → `public/assets/avatars/`
fallback: دائرة الأحرف الأولى (`Avatar` بدون صورة). يُربط لكل مستخدم بعد إضافة
حقل النوع/مفتاح الأفاتار (لتفادي إسناد خاطئ).

| file | usage | prompt | file | wired |
|---|---|---|---|---|
| `avatar_child_boy_01.png` | طفل (ولد) | ready | pending | عبر `Avatar src` — غير مُسنَد بعد |
| `avatar_child_girl_01.png` | طفلة (بنت) | ready | pending | كذلك |
| `avatar_teacher_male_01.png` | معلم | ready | pending | كذلك |
| `avatar_teacher_female_01.png` | معلمة | ready | pending | كذلك |
| `avatar_parent_father_01.png` | ولي أمر (أب) | ready | pending | كذلك |
| `avatar_parent_mother_01.png` | ولي أمر (أم) | ready | pending | كذلك |

## B. Badges  → `public/assets/badges/`
fallback: pill ذهبي نصّي (`BadgeMedal` → `Badge`).

| file | usage | prompt | file | wired |
|---|---|---|---|---|
| `badge_recitation.png` | أوسمة /child/progress (فئة quran) | ready | pending | ✅ BadgeMedal |
| `badge_good_behavior.png` | أوسمة (فئة behavior) | ready | pending | ✅ BadgeMedal |
| `badge_progress.png` | أوسمة (فئة progress) | ready | pending | ✅ BadgeMedal |
| `badge_attendance.png` | وسام الحضور | ready | pending | جاهز (يُربط لاحقًا) |
| `badge_participation.png` | وسام المشاركة | ready | pending | جاهز (يُربط لاحقًا) |

## C. Icons  → `public/assets/icons/`
fallback: الأيقونة الخطية الحالية (inline SVG) عبر `AppIcon`.

| file | usage | prompt | file | wired |
|---|---|---|---|---|
| `icon_home.png` | تنقل (طفل/معلم) | ready | pending | ✅ AppIcon |
| `icon_lessons.png` | تنقل الطفل — الدروس | ready | pending | ✅ AppIcon |
| `icon_tasks.png` | تنقل الطفل — مهامي | ready | pending | ✅ AppIcon |
| `icon_progress.png` | تنقل الطفل — تقدّمي | ready | pending | ✅ AppIcon |
| `icon_wishes.png` | تنقل الطفل — أمنياتي | ready | pending | ✅ AppIcon |
| `icon_preparation.png` | تنقل المعلم — التحضير | ready | pending | ✅ AppIcon |
| `icon_attendance.png` | تنقل المعلم — الحضور | ready | pending | ✅ AppIcon |
| `icon_children.png` | تنقل المعلم — الأطفال | ready | pending | ✅ AppIcon |
| `icon_review.png` | تنقل المعلم — المراجعات | ready | pending | ✅ AppIcon |
| `icon_activity.png` | تنقل المعلم — الأنشطة | ready | pending | ✅ AppIcon |
| `icon_demo_tools.png` | تنقل المعلم — أدوات التجربة | ready | pending | ✅ AppIcon |
| `icon_notifications.png` | جرس الإشعارات | ready | pending | جاهز (يُربط لاحقًا) |
| `icon_points.png` | شارة النقاط | ready | pending | جاهز (يُربط لاحقًا) |
| `icon_record_audio.png` | تسجيل صوت | ready | pending | جاهز (يُربط لاحقًا) |
| `icon_record_video.png` | تسجيل فيديو | ready | pending | جاهز (يُربط لاحقًا) |

## D. Support Illustrations  → `public/assets/illustrations/`
fallback: النص/الحالة الفارغة الحالية (`AssetImage` جاهز للاستخدام).

| file | usage | prompt | file | wired |
|---|---|---|---|---|
| `illustration_parent_approval.png` | /parent/approvals | ready | pending | جاهز (يُربط لاحقًا) |
| `illustration_no_tasks.png` | /child/tasks فارغ | ready | pending | جاهز (يُربط لاحقًا) |
| `illustration_waiting_review.png` | بانتظار مراجعة المعلم | ready | pending | جاهز (يُربط لاحقًا) |
| `illustration_success.png` | نجاح/إتمام | ready | pending | جاهز (يُربط لاحقًا) |

---

## تحديث الربط (تمّ)
- **أفاتارات:** ربط أفاتار الدور في رأس لوحة كل مستخدم (طفل/معلم/ولي أمر) مع
  fallback للأحرف الأولى. القوائم تبقى بالأحرف الأولى عمدًا (تمييز الأطفال).
- **أيقونات أفعال:** `icon_notifications` (الجرس)، `icon_points` (نقاطي)،
  `icon_record_audio`/`icon_record_video` (أزرار التسجيل + صفوف الفيديو في
  الموافقات/المراجعات) — كلها بـ fallback SVG الحالي.
- **رسومات:** `illustration_no_tasks` (مهام الطفل الفارغة)،
  `illustration_parent_approval` (موافقات ولي الأمر الفارغة)،
  `illustration_waiting_review` (مراجعات المعلم الفارغة) — بـ fallback آمن.

## الأولوية التالية
1. توليد + قص أصول **الأيقونات الـ 11 المربوطة** + **الأوسمة الثلاثة المربوطة**
   (أعلى أثر بصري فوري لأنها مربوطة بالفعل).
2. **الأفاتارات الستة** + إضافة حقل `gender`/`avatarKey` للبيانات ثم إسنادها.
3. أيقونات الأفعال (notifications/points/record/review) وربطها في أماكنها.
4. الرسومات المساندة وربطها في الحالات الفارغة.
