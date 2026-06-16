# ASSET INVENTORY — الأشبال

> جرد كامل لكل الأصول البصرية المطلوبة، مقسّمة حسب الفئة. كل أصل له اسم ملف ثابت
> (انظر Naming Convention في الأسفل) ويُولَّد عبر `docs/HIGGSFIELD_PROMPT_PACK.md`
> وفق `docs/VISUAL_ASSET_STYLE_LOCK.md`.
>
> **prompt status:** `test-batch` = ضمن دفعة الاختبار · `ready` = برومبت جاهز في
> الـ pack · `pending` = يُكتب بعد اعتماد الاتجاه.
> **priority:** P0 = دفعة الاختبار/حرج · P1 = مهم · P2 = لاحق.

الأحجام إرشادية (px). الأيقونات/الأوسمة/الأفاتارات/الرسومات = PNG شفاف؛ الخلفيات
= PNG/JPG غير شفاف.

---

## A. Backgrounds (غير شفافة)

| name (file) | type | priority | usage | transparent | size | prompt status |
|---|---|---|---|---|---|---|
| `background_app_main` | background | P1 | خلفية التطبيق العامة (AppShell) | no | 1440×2560 | ready |
| `background_child_home` | background | **P0** | `/child` الرئيسية | no | 1440×2560 | **test-batch** |
| `background_parent_home` | background | P1 | `/parent` | no | 1440×2560 | ready |
| `background_teacher_dashboard` | background | P1 | `/teacher` | no | 2560×1440 | ready |
| `background_guest` | background | P2 | `/guest` | no | 2560×1440 | ready |
| `background_activity` | background | P2 | شاشة النشاط/الاختبار | no | 1440×2560 | ready |
| `background_recitation` | background | P2 | شاشة التسجيل/التسميع | no | 1440×2560 | ready |
| `background_points` | background | P2 | قسم النقاط | no | 1440×2560 | ready |
| `background_badges` | background | P2 | قسم الأوسمة | no | 1440×2560 | ready |
| `background_empty_state` | background | P2 | خلفية محايدة للحالات الفارغة | no | 1440×1440 | ready |

---

## B. Icons (خلفية شفافة · ستايل دائري موحّد · واضحة عند الصغر)

نمط موحّد: رمز خطي/ممتلئ مدوّر، لون أساسي بنفسجي `#6D4CFF` مع لمسة `#9F84FF`،
بلا نص، قابل للاستخدام عند 24–32px.

| name (file) | usage page/area | priority | transparent | size | prompt status |
|---|---|---|---|---|---|
| `icon_home` | تنقل — الرئيسية | P1 | yes | 512×512 | ready |
| `icon_lessons` | تنقل — الدروس | P1 | yes | 512×512 | ready |
| `icon_tasks` | تنقل — مهامي | **P0** | yes | 512×512 | ready |
| `icon_progress` | تنقل — التقدّم | P1 | yes | 512×512 | ready |
| `icon_wishes` | تنقل — الأمنيات | P1 | yes | 512×512 | ready |
| `icon_attendance` | الحضور | P1 | yes | 512×512 | ready |
| `icon_recitation` | التسميع/التسجيل | **P0** | yes | 512×512 | **test-batch** |
| `icon_reviews` | مراجعات المعلم | P1 | yes | 512×512 | ready |
| `icon_approvals` | موافقات ولي الأمر | P1 | yes | 512×512 | ready |
| `icon_activities` | الأنشطة | P1 | yes | 512×512 | ready |
| `icon_points` | النقاط | **P0** | yes | 512×512 | **test-batch** |
| `icon_badges` | الأوسمة | P1 | yes | 512×512 | ready |
| `icon_children` | الأطفال | P1 | yes | 512×512 | ready |
| `icon_parent` | ولي الأمر | P2 | yes | 512×512 | ready |
| `icon_teacher` | المعلم | P2 | yes | 512×512 | ready |
| `icon_guest` | الضيف | P2 | yes | 512×512 | ready |
| `icon_notifications` | الإشعارات | P1 | yes | 512×512 | ready |
| `icon_preparation` | التحضير | P1 | yes | 512×512 | ready |
| `icon_demo_tools` | أدوات التجربة | P2 | yes | 512×512 | ready |
| `icon_video_recording` | تسجيل فيديو | P1 | yes | 512×512 | ready |
| `icon_audio_recording` | تسجيل صوت | P1 | yes | 512×512 | ready |

---

## C. Badges / Medals (خلفية شفافة · درع/دائرة مدوّرة · أكسنت ذهبي للإنجاز)

لكل وسام نسخة `unlocked` (ملوّنة) ولاحقًا `locked` (رمادية باهتة بنفس الشكل).
ملف: `badge_<key>` (و`badge_<key>_locked` لاحقًا).

| name (file) | المعنى | الرمز البصري | accent | priority | prompt status |
|---|---|---|---|---|---|
| `badge_persistence` | وسام المثابر | نجمة صاعدة + قوس | gold | P1 | ready |
| `badge_attendance` | وسام الحضور | تقويم/دائرة صح | mint | P1 | ready |
| `badge_progress` | وسام التقدّم | حلقة تقدّم صاعدة | purple | P1 | ready |
| `badge_good_behavior` | وسام حسن السلوك | قلب/يد لطيفة | mint | **P0** | **test-batch** |
| `badge_recitation_master` | وسام التسميع المميز | كتاب مفتوح + نجمة | gold | **P0** | **test-batch** |
| `badge_activity` | وسام النشاط | شرارة/علم صغير | purple | P1 | ready |
| `badge_improvement` | وسام التحسّن | سهم صاعد + قوس | mint | P1 | ready |
| `badge_weekly_achievement` | وسام الإنجاز الأسبوعي | درع + رقم ٧ مجرّد (بلا نص) | gold | P2 | ready |
| `badge_circle_star` | وسام نجم الحلقة | نجمة داخل حلقة | gold | P1 | ready |
| `badge_cooperation` | وسام التعاون | حلقتان متشابكتان | purple | P2 | ready |
| `badge_dutiful` | وسام بر الوالدين | قلب + يدان | coral/gold | P2 | ready |
| `badge_focus` | وسام الهدوء والتركيز | هلال + دائرة هادئة | purple | P2 | ready |

---

## D. Default Avatars (خلفية شفافة · رمزية محافظة · بلا وجوه واقعية)

أفاتارات بديلة عن صورة المستخدم. شخصية مجرّدة لطيفة (شكل دائري + رمز)، **بلا
ملامح واقعية**، محافظة ومناسبة لبيئة عائلية، ولا تشبه شخصيات مشهورة.

### Children avatars

| name (file) | وصف | priority | transparent | prompt status |
|---|---|---|---|---|
| `avatar_child_01` | شبل لطيف بقلنسوة بنفسجية | **P0** | yes | **test-batch** |
| `avatar_child_02` | شبل بنجمة على الصدر | P1 | yes | ready |
| `avatar_child_03` | فتاة بحجاب لطيف بنفسجي | P1 | yes | ready |
| `avatar_child_04` | طفل بكتاب صغير | P1 | yes | ready |
| `avatar_child_05` | فتاة بحجاب لافندر + نجمة | P1 | yes | ready |
| `avatar_child_06` | شبل بابتسامة بسيطة دائرية | P1 | yes | ready |

### Parent avatars

| name (file) | وصف | priority | transparent | prompt status |
|---|---|---|---|---|
| `avatar_parent_01` | شخصية أب هادئة مجرّدة | P2 | yes | ready |
| `avatar_parent_02` | شخصية أم بحجاب لطيف | P2 | yes | ready |
| `avatar_parent_03` | شخصية ولي أمر محايدة داعمة | P2 | yes | ready |

### Teacher avatars

| name (file) | وصف | priority | transparent | prompt status |
|---|---|---|---|---|
| `avatar_teacher_01` | معلم وقور لطيف بعمامة مبسّطة | **P0** | yes | **test-batch** |
| `avatar_teacher_02` | معلمة بحجاب وقور | P2 | yes | ready |
| `avatar_teacher_03` | معلم بكتاب/مؤشّر مجرّد | P2 | yes | ready |

---

## E. Empty State Illustrations (خلفية شفافة · لطيفة · مساحة سالبة مريحة)

| name (file) | usage page | illustration idea | size | prompt status |
|---|---|---|---|---|
| `empty_tasks` | `/child/tasks` | كتاب مغلق + نجمة نائمة هادئة | 800×600 | **test-batch** (P0) |
| `empty_points` | `/child/progress` نقاطي | حلقة فارغة + نجمة باهتة | 800×600 | ready |
| `empty_activities` | `/teacher/activities` · `/child` | شرارة مطفأة لطيفة داخل دائرة | 800×600 | ready |
| `empty_approvals` | `/parent/approvals` | درع/علامة صح مطمئنة | 800×600 | ready |
| `empty_reviews` | `/teacher/reviews` | شاشة تسميع هادئة فارغة | 800×600 | ready |
| `empty_preparation` | `/teacher/prep` | بطاقة درس فارغة + قلم | 800×600 | ready |
| `empty_notifications` | جرس الإشعارات | جرس هادئ + نقطة خافتة | 800×600 | ready |
| `empty_recordings` | مشغّل التسجيل | ميكروفون هادئ داخل دائرة | 800×600 | ready |

---

## F. Feature Illustrations (خلفية شفافة · مشهد مصغّر موحّد الستايل)

| name (file) | الميزة | usage | size | prompt status |
|---|---|---|---|---|
| `illustration_recitation` | التسميع | كرت التسميع / onboarding | 1024×768 | ready |
| `illustration_join_lesson` | دخول الدرس | بوابة الحضور | 1024×768 | ready |
| `illustration_open_activity` | النشاط المفتوح | كرت النشاط في `/child` | 1024×768 | ready |
| `illustration_points` | النقاط والتشجيع | قسم النقاط | 1024×768 | ready |
| `illustration_child_wishes` | أمنيات الطفل | `/child/wishes` | 1024×768 | ready |
| `illustration_parent_approval` | موافقة ولي الأمر | `/parent/approvals` | 1024×768 | **test-batch** (P0) |
| `illustration_teacher_review` | مراجعة المعلم | `/teacher/reviews` | 1024×768 | ready |
| `illustration_lesson_prep` | تحضير الدرس | `/teacher/prep` | 1024×768 | ready |
| `illustration_attendance` | الحضور | `/teacher/attendance` | 1024×768 | ready |
| `illustration_child_achievement` | إنجاز الطفل | شاشة الإنجاز/الأوسمة | 1024×768 | ready |

---

## First Test Batch (P0 — تُولَّد أولًا لاعتماد الاتجاه فقط)

1. `background_child_home`
2. `icon_recitation`
3. `icon_points`
4. `badge_recitation_master`
5. `badge_good_behavior`
6. `avatar_child_01`
7. `avatar_teacher_01`
8. `empty_tasks`
9. `illustration_parent_approval`

تُحفظ مبدئيًا في `assets/generated/test-batch/` للمراجعة، ولا تُعتمد ولا تُركّب
في التطبيق قبل الموافقة.

---

## Naming Convention

```
background_<area>.png        background_app_main.png · background_child_home.png
icon_<key>.png               icon_recitation.png · icon_points.png
badge_<key>.png              badge_recitation_master.png  (+ badge_<key>_locked.png لاحقًا)
avatar_<role>_<NN>.png       avatar_child_01.png · avatar_teacher_01.png
empty_<key>.png              empty_tasks.png
illustration_<key>.png       illustration_parent_approval.png
```

قواعد: حروف صغيرة، `snake_case`، أرقام بخانتين للأفاتارات، صيغة `.png` افتراضيًا
(الخلفيات يجوز `.jpg`)، بلا مسافات، بلا حروف عربية في اسم الملف.

مواقع الحفظ:
```
assets/generated/backgrounds/   assets/generated/icons/
assets/generated/badges/        assets/generated/avatars/
assets/generated/empty-states/  assets/generated/illustrations/
assets/generated/test-batch/    (دفعة الاختبار المبدئية)
```
