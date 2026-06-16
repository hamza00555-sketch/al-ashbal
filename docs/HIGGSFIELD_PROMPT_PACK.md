# HIGGSFIELD / GPT IMAGE — PROMPT PACK — الأشبال

> نظام برومبت موحّد لتوليد أصول "الأشبال" عبر Higgsfield (GPT Image pipeline) أو
> مهارة `gpt-image-2`. كل برومبت = **SUBJECT** خاص بالأصل + **STYLE SUFFIX**
> الموحّد + **NEGATIVE/AVOID** الموحّد. الالتزام بـ `VISUAL_ASSET_STYLE_LOCK.md`.
>
> لا تكتب أي نص داخل الصورة (لا عربي ولا إنجليزي). الأيقونات/الأوسمة/الأفاتارات/
> الرسومات = transparent background. الخلفيات = غير شفافة.

---

## 0. Global System

**STYLE SUFFIX (يُلصق في نهاية كل برومبت):**

```
Style: soft rounded flat vector illustration, clean geometric shapes, smooth
curves, gentle depth with one soft shadow, subtle purple glow, premium yet warm
Arabic family Quran-learning app aesthetic, calm and uncluttered, generous
negative space, consistent line weight, readable at small sizes.
Palette (strict): deep purple #1A1038, royal purple #2B1763, primary purple
#6D4CFF, soft purple #9F84FF, light lavender #D8CCFF, warm cream #FFF8EA,
accent gold #F6C65B (achievements only), mint #63D9A0 (success only),
coral #F97373 (gentle alert only). Purple-first.
```

**NEGATIVE / AVOID (موحّد لكل الأصول):**

```
no text, no letters, no arabic script, no calligraphy, no words, no numbers,
no human faces with realistic features, no photoreal, no photograph, no real
people, no celebrities, no heavy religious symbols, no detailed mosque, no
praying figures, no quran verses, heavy 3D, no glossy plastic render, no neon,
no harsh gradients, no busy background, no clutter, no tiny details, no
watermark, no logo, no UI chrome, no drop-shadow text, not childish cartoon,
no mascot domination, no green islamic cliché.
```

**Output defaults:** PNG. transparent background للأيقونات/الأوسمة/الأفاتارات/
الرسومات؛ خلفية ممتلئة للـ backgrounds. مربّع للأيقونات/الأوسمة/الأفاتارات،
أفقي/رأسي للخلفيات والرسومات حسب الجرد. naming convention من `ASSET_INVENTORY.md`.

---

## 1. TEST BATCH (9 prompts — جاهزة للتشغيل الآن)

> كل برومبت أدناه كامل = SUBJECT + (الحق به STYLE SUFFIX و NEGATIVE من القسم 0).

### 1) `background_child_home` — خلفية رئيسية الطفل
- purpose: خلفية صفحة `/child` · format: PNG/JPG · transparent: **no** · size: 1440×2560 (9:16)
```
A calm vertical mobile app background for a children's Quran-learning home
screen. Smooth deep-purple radial gradient from primary purple #6D4CFF at the
top center fading into deep purple #1A1038 and night purple #0D0820 at the
bottom. Faint floating circles, a few tiny soft stars, one very subtle thin
crescent, and gentle soft-glow orbs, all extremely low-contrast so UI cards stay
readable on top. Mostly empty safe area in the center.
```

### 2) `icon_recitation` — أيقونة التسميع
- purpose: أيقونة تسجيل/تسميع · transparent: **yes** · size: 512×512
```
A single app icon of an abstract open book with a small soft sound-wave arc
rising from it, rounded thick strokes, primary purple #6D4CFF with soft purple
#9F84FF accent, centered, balanced, transparent background, no scene.
```

### 3) `icon_points` — أيقونة النقاط
- purpose: أيقونة النقاط · transparent: **yes** · size: 512×512
```
A single app icon of a simple rounded five-point star inside a thin circular
ring, friendly and clean, primary purple #6D4CFF with a warm gold #F6C65B
highlight on the star, rounded thick strokes, centered, transparent background.
```

### 4) `badge_recitation_master` — وسام التسميع المميز
- purpose: وسام إنجاز · transparent: **yes** · size: 512×512
```
A rounded achievement medal: a soft circular badge with a gentle gold rim
(#F6C65B gradient) over a purple core #2B1763, featuring an abstract open book
with a small star above it in the center, subtle inner glow, premium but simple,
centered, transparent background, no ribbon text.
```

### 5) `badge_good_behavior` — وسام حسن السلوك
- purpose: وسام إنجاز · transparent: **yes** · size: 512×512
```
A rounded achievement medal: a soft circular badge with a mint #63D9A0 accent
ring over a purple core #2B1763, featuring a simple rounded heart symbol in the
center, gentle glow, clean and warm, centered, transparent background.
```

### 6) `avatar_child_01` — أفاتار طفل
- purpose: أفاتار افتراضي للطفل · transparent: **yes** · size: 512×512
```
A cute abstract child avatar for a learning app: a friendly rounded character
shaped like a tiny lion cub wearing a soft purple cap, simple dot eyes and a
gentle smile (no realistic facial features), modest and conservative, head-and
-shoulders inside an implied circle, primary purple and lavender palette,
transparent background.
```

### 7) `avatar_teacher_01` — أفاتار معلم
- purpose: أفاتار افتراضي للمعلم · transparent: **yes** · size: 512×512
```
A dignified yet friendly abstract teacher avatar: a calm rounded character with
a simplified turban/cap, simple dot eyes and a kind gentle expression (no
realistic facial features), modest and respectful, head-and-shoulders inside an
implied circle, deep purple and soft purple palette with a small gold accent,
transparent background.
```

### 8) `empty_tasks` — حالة فارغة: لا توجد مهام
- purpose: رسمة حالة فارغة · transparent: **yes** · size: 800×600
```
A gentle empty-state illustration: a closed rounded book resting peacefully with
a single small sleeping star above it, soft purple and lavender tones with a
faint glow, lots of calm negative space, centered, transparent background, no
text.
```

### 9) `illustration_parent_approval` — موافقة ولي الأمر
- purpose: رسمة ميزة · transparent: **yes** · size: 1024×768
```
A small friendly feature illustration representing a parent approving a child's
recitation: an abstract rounded shield with a soft check mark, beside a small
play-circle and a tiny sound-wave, connected by a gentle protective arc, mint
#63D9A0 check accent over a purple scene, no faces, calm and reassuring,
centered composition, transparent background, no text.
```

---

## 2. Backgrounds — SUBJECT templates (بقية الخلفيات)

> القالب: `A calm <orientation> background for <area>, smooth purple gradient
> (#6D4CFF→#1A1038→#0D0820), faint floating circles + a few soft stars + subtle
> glow orbs, very low contrast, mostly empty safe area.` + STYLE/NEGATIVE.

| file | subject focus |
|---|---|
| `background_app_main` | محايدة عامة، أكثر هدوءًا وتجريدًا |
| `background_parent_home` | هادئة طمأنينة، توهّج لطيف أعلى اليمين |
| `background_teacher_dashboard` | أفقية واسعة، شبكة نقاط خافتة جدًا |
| `background_guest` | أفقية رسمية هادئة، أبسط العناصر |
| `background_activity` | إيقاع لطيف، شرارات خافتة جدًا |
| `background_recitation` | موجات صوت خافتة جدًا في الأسفل |
| `background_points` | نجوم خافتة متناثرة |
| `background_badges` | حلقات/دوائر خافتة كأوسمة باهتة |
| `background_empty_state` | شبه سادة، توهّج مركزي خفيف |

---

## 3. Icons — SUBJECT templates (بقية الأيقونات)

> القالب: `A single app icon of <symbol>, rounded thick strokes, primary purple
> #6D4CFF with #9F84FF accent, centered, transparent background, no scene.`

| file | symbol |
|---|---|
| `icon_home` | بيت مدوّر بسيط |
| `icon_lessons` | كتاب/سبورة مبسّطة |
| `icon_tasks` | قائمة بعلامة صح دائرية |
| `icon_progress` | حلقة تقدّم بسهم صاعد |
| `icon_wishes` | نجمة أمنية/مصباح لطيف |
| `icon_attendance` | تقويم بعلامة صح |
| `icon_reviews` | شاشة تشغيل + علامة صح |
| `icon_approvals` | درع بعلامة صح |
| `icon_activities` | شرارة/علم صغير |
| `icon_badges` | وسام دائري مبسّط |
| `icon_children` | شخصيتان صغيرتان دائريتان |
| `icon_parent` | شخصية كبيرة وصغيرة بجانبها |
| `icon_teacher` | شخصية بعمامة مبسّطة |
| `icon_guest` | شخصية محايدة داخل دائرة |
| `icon_notifications` | جرس مدوّر |
| `icon_preparation` | بطاقة درس بقلم |
| `icon_demo_tools` | مفتاح ربط/تروس مبسّطة |
| `icon_video_recording` | كاميرا فيديو مدوّرة |
| `icon_audio_recording` | ميكروفون مدوّر |

---

## 4. Badges — SUBJECT templates (بقية الأوسمة)

> القالب: `A rounded achievement medal: soft circular badge, <accent> ring over
> purple core #2B1763, featuring <symbol> in the center, gentle glow, premium
> but simple, centered, transparent background, no ribbon text.`
> النسخة المقفلة لاحقًا: نفس الشكل بدرجات رمادية باهتة + قفل صغير = `badge_<key>_locked`.

| file | symbol | accent |
|---|---|---|
| `badge_persistence` | نجمة صاعدة فوق قوس | gold |
| `badge_attendance` | تقويم بعلامة صح | mint |
| `badge_progress` | حلقة تقدّم صاعدة | purple |
| `badge_activity` | شرارة/علم صغير | purple |
| `badge_improvement` | سهم صاعد فوق قوس | mint |
| `badge_weekly_achievement` | درع بسبع نقاط دائرية | gold |
| `badge_circle_star` | نجمة داخل حلقة | gold |
| `badge_cooperation` | حلقتان متشابكتان | purple |
| `badge_dutiful` | قلب بين يدين لطيفتين | coral+gold |
| `badge_focus` | هلال داخل دائرة هادئة | purple |

---

## 5. Avatars — SUBJECT templates (بقية الأفاتارات)

> القالب: `A cute/dignified abstract <role> avatar, friendly rounded character,
> simple dot eyes and gentle expression (no realistic facial features), modest
> and conservative, head-and-shoulders in an implied circle, purple/lavender
> palette, transparent background.`

- children: `avatar_child_02..06` — تنويع لطيف (نجمة/كتاب/حجاب لافندر/ابتسامة).
- parents: `avatar_parent_01..03` — شخصيات داعمة هادئة (أب/أم بحجاب/محايد).
- teachers: `avatar_teacher_02..03` — معلمة بحجاب وقور / معلم بكتاب مجرّد.

---

## 6. Empty States — SUBJECT templates (بقية الحالات)

> القالب: `A gentle empty-state illustration of <idea>, soft purple/lavender
> tones, faint glow, lots of calm negative space, centered, transparent, no text.`

| file | idea |
|---|---|
| `empty_points` | حلقة فارغة ونجمة باهتة |
| `empty_activities` | شرارة مطفأة داخل دائرة |
| `empty_approvals` | درع بعلامة صح مطمئنة |
| `empty_reviews` | شاشة تسميع هادئة فارغة |
| `empty_preparation` | بطاقة درس فارغة بقلم |
| `empty_notifications` | جرس هادئ بنقطة خافتة |
| `empty_recordings` | ميكروفون هادئ داخل دائرة |

---

## 7. Feature Illustrations — SUBJECT templates (بقية الرسومات)

> القالب: `A small friendly feature illustration representing <feature>, abstract
> rounded objects only, no faces, calm, centered, transparent, no text.`

| file | feature focus |
|---|---|
| `illustration_recitation` | كتاب مفتوح + موجة صوت + نجمة |
| `illustration_join_lesson` | بوابة/دائرة دخول + سهم لطيف |
| `illustration_open_activity` | شرارة نشاط داخل دائرة مفتوحة |
| `illustration_points` | نجوم تتجمّع في حلقة |
| `illustration_child_wishes` | مصباح/نجمة أمنية لطيفة |
| `illustration_teacher_review` | شاشة تشغيل + علامة صح + نجمة |
| `illustration_lesson_prep` | بطاقة درس + قلم + كتاب |
| `illustration_attendance` | تقويم + علامة صح + حلقة |
| `illustration_child_achievement` | وسام + نجوم احتفال خفيفة |

---

## 8. سير التوليد المعتمد

1. لا تُولّد إلا بعد اعتماد `VISUAL_ASSET_STYLE_LOCK.md`.
2. ابدأ بدفعة الاختبار (القسم 1) فقط → احفظ في `assets/generated/test-batch/`.
3. بعد اعتماد الاتجاه: ولّد بقية الأصول دفعات حسب priority (P1 ثم P2) إلى مجلداتها.
4. التزم naming convention، وراجع كل دفعة قبل التركيب في التطبيق (مهمة لاحقة).
