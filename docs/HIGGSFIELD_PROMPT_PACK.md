# HIGGSFIELD PROMPT PACK — الأشبال (v2 · Soft 3D Cute)

> نظام برومبت موحّد للستايل الجديد **soft 3D cute**. كل برومبت = **SUBJECT** +
> **STYLE SUFFIX** الموحّد + **NEGATIVE/AVOID**. الالتزام بـ
> `VISUAL_ASSET_STYLE_LOCK.md` (v2) و`TRANSPARENT_ASSET_PIPELINE.md`.
>
> النموذج المعتمد للستايل 3D: **`flux_2`** (Higgsfield). الأصول الصغيرة تُولَّد على
> خلفية سادة محايدة ثم تمر على `remove_background` لإخراج PNG شفاف. الخلفيات مشهد
> كامل غير شفاف. **لا نص داخل أي أصل.**

---

## 0. Global System

**STYLE SUFFIX (يُلصق في نهاية كل برومبت):**

```
Style: cute soft 3D render, rounded clay-like forms, smooth matte surfaces,
gentle soft studio lighting from above, subtle depth, soft contact shadow,
premium yet warm toy-like educational app asset, purple-first, minimal,
single clear subject, very readable silhouette.
Palette: deep purple #1A1038, royal purple #2B1763, primary purple #6D4CFF,
soft purple #9F84FF, light lavender #D8CCFF, warm cream #FFF8EA, accent gold
#F6C65B (achievements only), mint #63D9A0 (success only), coral #F97373
(gentle alert only).
```

**SMALL-ASSET SUFFIX (للأيقونات/الأوسمة/الأفاتارات/الرسومات الصغيرة — للقص لاحقًا):**

```
centered, isolated single object, on a plain flat light-gray (#EDEDED) studio
backdrop, even lighting, no scene, no props, no cast shadow on the backdrop.
```
> ثم مرّر الناتج على `remove_background` → PNG شفاف مقصوص.

**GLOBAL NEGATIVE / AVOID:**

```
no text, no letters, no arabic script, no calligraphy, no words, no numbers,
flat illustration, flat icon, generic vector, 2D sticker, ambiguous shape,
no realistic human face, no photoreal, no photograph, real people, heavy
realistic 3D, glossy plastic glare, harsh reflections, over-detailed render,
busy scene, cluttered composition, multiple objects, religious calligraphy,
detailed mosque, praying figures, neon, harsh gradient, watermark, logo, UI
frame, drop shadow text, matte halo, white edges.
```

**Output:** PNG. naming من `ASSET_INVENTORY.md`. مربّع للأيقونات/الأوسمة/الأفاتارات؛
أفقي/رأسي للخلفيات والرسومات.

---

## 1. NEW TEST BATCH (9 prompts — الستايل 3D · جاهزة)

> صغار الأصول: ألحق SMALL-ASSET SUFFIX + STYLE SUFFIX، ثم `remove_background`.
> الخلفية: STYLE SUFFIX فقط، مشهد كامل، بلا قص.

### 1) `background_child_home` — خلفية رئيسية الطفل (full bg, no transparency)
```
A calm vertical mobile app background for a children's Quran-learning home: a
smooth deep-purple gradient (primary purple #6D4CFF glow at top center fading to
deep purple #1A1038 and night purple #0D0820), with a few soft 3D puffy floating
spheres, tiny rounded stars and one subtle puffy crescent gently blurred in the
distance, very low contrast, large empty safe area in the center.
```

### 2) `icon_recitation` — أيقونة التسميع (transparent)
```
A cute soft 3D app icon of a small rounded open book with a soft glowing
sound-wave arc rising from it, purple book with lavender pages, friendly and
clean.
```

### 3) `icon_points` — أيقونة النقاط (transparent)
```
A cute soft 3D app icon of a single puffy rounded five-point star inside a soft
3D ring, purple ring with a warm gold #F6C65B star, friendly and clean.
```

### 4) `badge_recitation_master` — وسام التسميع المميز (transparent)
```
A cute soft 3D achievement medal: a rounded glossy-matte circular badge with a
soft gold #F6C65B rim and a purple #2B1763 core, a small rounded open book with a
tiny star floating above it in the center, gentle inner glow, premium but simple.
```

### 5) `badge_good_behavior` — وسام حسن السلوك (transparent)
```
A cute soft 3D achievement medal: a rounded circular badge with a soft mint
#63D9A0 ring and a purple #2B1763 core, a simple puffy rounded heart in the
center, gentle glow, warm and clean.
```

### 6) `avatar_child_01` — أفاتار طفل (transparent)
```
A cute soft 3D character avatar of a friendly little lion cub mascot wearing a
soft purple cap, big rounded head, simple dot eyes and a gentle smile (symbolic,
not realistic), modest and warm, head-and-shoulders bust, purple and lavender.
```

### 7) `avatar_teacher_01` — أفاتار معلم (transparent)
```
A cute soft 3D character avatar of a kind dignified teacher mascot with a soft
simplified turban/cap, big rounded head, simple dot eyes and a gentle calm smile
(symbolic, not realistic), modest and respectful, head-and-shoulders bust, deep
purple and soft purple with a small gold accent.
```

### 8) `empty_tasks` — حالة فارغة: لا مهام (transparent)
```
A cute soft 3D object for an empty state: a closed rounded purple book resting,
with a single small sleeping puffy star with closed eyes floating above it,
calm and gentle, soft lavender highlights.
```

### 9) `illustration_parent_approval` — موافقة ولي الأمر (transparent)
```
A cute soft 3D mini scene (objects only, no faces): a rounded purple shield with
a soft mint #63D9A0 check mark, next to a small rounded play-circle and a tiny
puffy sound-wave, gently grouped together, calm and reassuring.
```

---

## 2. Per-category SUBJECT templates + AVOID (لبقية الأصول لاحقًا)

> القالب العام: `<SUBJECT>` + STYLE SUFFIX (+ SMALL-ASSET SUFFIX للصغار) + GLOBAL
> NEGATIVE + الـ AVOID الخاص بالفئة.

### A. Backgrounds (full, non-transparent)
- AVOID إضافي: `no isolated object, no transparency, no high-contrast shapes over the safe area, no text.`
- subjects: نفس قالب الخلفية أعلاه مع تغيير المزاج (parent=طمأنينة، teacher=أفقي واسع، guest=رسمي هادئ، activity=إيقاع لطيف، recitation=موجات خافتة، points=نجوم خافتة، badges=حلقات خافتة، empty=شبه سادة).

### B. Icons (transparent · واضح عند 24–32px)
- AVOID إضافي: `no scene, no background object, no tiny details, no text label, single symbol only.`
- subjects: `home`=بيت puffy · `lessons`=سبورة/كتاب · `tasks`=قائمة بعلامة صح · `progress`=حلقة بسهم صاعد · `wishes`=نجمة/مصباح · `attendance`=تقويم بصح · `reviews`=دائرة تشغيل بصح · `approvals`=درع بصح · `activities`=شرارة/علم · `badges`=ميدالية · `children`=شخصيتان صغيرتان · `parent`=كبير وصغير · `teacher`=شخصية بعمامة · `guest`=شخصية محايدة · `notifications`=جرس · `preparation`=بطاقة بقلم · `demo_tools`=مفتاح/تروس · `video_recording`=كاميرا · `audio_recording`=ميكروفون.

### C. Badges (transparent · ميدالية 3D)
- AVOID إضافي: `no ribbon text, no engraved letters, no realistic metal, single central symbol.`
- subjects (accent): persistence=نجمة صاعدة/gold · attendance=تقويم بصح/mint · progress=حلقة صاعدة/purple · activity=شرارة/purple · improvement=سهم صاعد/mint · weekly=درع بسبع نقاط/gold · circle_star=نجمة في حلقة/gold · cooperation=حلقتان متشابكتان/purple · dutiful=قلب بين يدين/coral+gold · focus=هلال في دائرة هادئة/purple. (نسخة `_locked` لاحقًا: نفس الشكل matte رمادي + قفل صغير).

### D. Avatars (transparent · شخصية 3D لطيفة)
- AVOID إضافي: `no realistic face, no real person, no celebrity, symbolic dot eyes only, modest.`
- children 02–06: تنويع (نجمة على الصدر/فتاة بحجاب لافندر/طفل بكتاب صغير/فتاة بنجمة/شبل مبتسم). parents 01–03: أب هادئ/أم بحجاب/ولي أمر محايد داعم. teachers 02–03: معلمة بحجاب وقور/معلم بكتاب مجرّد.

### E. Empty States (transparent · جسم 3D هادئ)
- AVOID إضافي: `no faces (unless a tiny symbolic mascot), calm, lots of empty space, single object.`
- subjects: points=حلقة فارغة ونجمة باهتة · activities=شرارة مطفأة في دائرة · approvals=درع بصح مطمئن · reviews=شاشة تشغيل هادئة · preparation=بطاقة درس بقلم · notifications=جرس هادئ بنقطة · recordings=ميكروفون هادئ.

### F. Feature Illustrations (transparent · مشهد مصغّر objects-only)
- AVOID إضافي: `objects only, no faces, no scene clutter, grouped neatly.`
- subjects: recitation=كتاب+موجة+نجمة · join_lesson=بوابة/دائرة دخول بسهم · open_activity=شرارة نشاط في دائرة مفتوحة · points=نجوم تتجمّع في حلقة · child_wishes=مصباح/نجمة أمنية · teacher_review=دائرة تشغيل بصح ونجمة · lesson_prep=بطاقة درس+قلم+كتاب · attendance=تقويم بصح وحلقة · child_achievement=ميدالية ونجوم احتفال خفيفة.

---

## 3. سير التوليد المعتمد (v2)

1. لا توليد كبير قبل اعتماد دفعة الاختبار الجديدة (القسم 1).
2. لكل أصل صغير: `flux_2` على خلفية سادة → `remove_background` → PNG شفاف.
3. الخلفيات: `flux_2` مشهد كامل، بلا قص.
4. احفظ في `assets/generated/<category>/` بالأسماء المعتمدة، وراجع QA لكل أصل.
