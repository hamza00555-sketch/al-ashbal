# OVERLAY ASSET PROMPTS — Contrast Card Overlays (Phase 2)

> **حالة:** prompt pack فقط — لا توليد، لا تطبيق، لا تعديل كود. يُولَّد لاحقًا عبر
> Higgsfield أو GPT Image 2 ثم يُقصّ شفافًا ويوضع في `public/assets/overlays/`.
>
> هذه الأصول **زخرفية فقط (decorative overlays)** توضع خلف محتوى بعض الكروت
> الفاتحة لاحقًا بشفافية منخفضة (opacity ‎0.08–0.14‎). يجب أن تُقرأ كـ
> silhouette / soft 3D motif واضح حتى عند الشفافية المنخفضة.

---

## مواصفات عامة (تنطبق على الأربعة)

- PNG شفاف · **1024×1024** · no background · centered object · safe margins.
- soft 3D · premium cute educational app style · object كبير ونظيف.
- اللوحة: **purple / lavender / warm cream / pale gold** فقط.
- ممنوع: turquoise · mint · cyan · neon حاد · تفاصيل مزدحمة · صورة واقعية · UI/card/phone mockup · أي خلفية أو إطار.
- شكل واضح بحوافّ ناعمة لكن **مقروء عند opacity منخفض** (تباين داخلي كافٍ في الشكل).
- النموذج المقترح: Higgsfield `nano_banana_pro` أو `flux_2` · `aspect_ratio: 1:1` · ثم `remove_background`.

## Negative Prompt موحّد (لكل الأصول)

```
no text, no letters, no logo, no background, no UI card, no phone screen,
no people, no realistic photo, no harsh outlines, no cyan, no turquoise,
no mint, no neon, no clutter, no watermark, no frame, no square tile background
```

---

## 1) `overlay_wishes_star.png`

- **أين يُستخدم:** كرت "أمنياتي" في `/child` · كروت الأمنيات في `/child/wishes`.
- **وظيفة الرسمة:** watermark زخرفي خلف محتوى كرت الأمنيات — رمز حلم/أمنية ناعم، غير طفولي وغير ذهبي صارخ.

**Higgsfield Prompt:**
```
A single large soft 3D wish star, smooth matte clay-like render, gentle inner
glow with a few tiny soft sparkles nearby, soft warm cream and pale gold body
with a faint lavender rim light, rounded friendly premium shape (not childish),
perfectly centered with generous margin, transparent background, decorative
motif only.
```

**GPT Image 2 Prompt:**
```
Create a single decorative wish-star motif on a fully TRANSPARENT background
(alpha, no backdrop). One large soft 3D five-point star, smooth matte clay
finish, gentle inner glow and a few faint sparkles around it. Colors limited to
warm cream and pale gold with a subtle lavender edge light — calm and premium,
not neon, not bright gold. Object centered with safe margins, large and clean.
No text, no letters, no UI, no card, no border, no square background, no ground
shadow. Must read clearly as a faint silhouette at 8–14% opacity.
```

- **ملاحظات توليد:** أبقِ النجمة مفردة وكبيرة، الـ sparkles خفيفة جدًا حتى لا تزدحم.
- **قص/شفافية:** لو خرج على خلفية مصمتة → `remove_background`. تأكد أن الحواف ناعمة بلا هالة بيضاء.

---

## 2) `overlay_progress_ring.png`

- **أين يُستخدم:** كرت "تقدّمي" في `/child` · كرت التقدّم في `/child/progress`.
- **وظيفة الرسمة:** watermark يدل على التطوّر — حلقة تقدّم/مسار صاعد، لا chart ولا أرقام.

**Higgsfield Prompt:**
```
A single soft 3D circular progress ring (an open, incomplete ring) with a small
gentle upward arrow softly integrated into the ring, smooth matte 3D render,
lavender and pale purple body with a subtle pale-gold accent on the progress
arc, rounded soft ends, perfectly centered with generous margin, transparent
background, no numbers, no chart, decorative motif only.
```

**GPT Image 2 Prompt:**
```
Create a single decorative progress-ring motif on a fully TRANSPARENT
background. One soft 3D circular ring that is partially open (like circular
progress ~70%), with rounded soft ends and a small gentle upward arrow blended
softly into it. Colors limited to lavender / pale purple with one subtle
pale-gold accent on the filled arc. Calm, premium, soft 3D — no neon. Centered,
large, clean, with safe margins. No numbers, no chart, no text, no UI, no card,
no border, no square background. Must read as a faint silhouette at 8–14%
opacity.
```

- **ملاحظات توليد:** الحلقة مفتوحة (ناقصة) لإيحاء التقدّم؛ السهم مدمج بنعومة لا منفصل.
- **قص/شفافية:** المركز يبقى مفرّغًا (شفاف) — مفيد لو وُضع محتوى فوقه.

---

## 3) `overlay_badge_silhouette.png`

- **أين يُستخدم:** كرت "أوسمتي" في `/child/progress` · كروت الأوسمة/النقاط لاحقًا.
- **وظيفة الرسمة:** ظل وسام/ميدالية زخرفي خلف الأوسمة الفعلية.

**Higgsfield Prompt:**
```
A single soft 3D medal / badge silhouette, smooth matte render, simple rounded
medallion with a small soft ribbon hint at the bottom, pale gold body with soft
lavender shading, calm and premium (not shiny, not neon), no central emblem
detail, perfectly centered with generous margin, transparent background,
decorative watermark motif only.
```

**GPT Image 2 Prompt:**
```
Create a single decorative medal/badge silhouette on a fully TRANSPARENT
background. One simple rounded medallion with a small soft ribbon hint beneath
it, soft 3D matte finish. Colors limited to pale gold with gentle lavender
shading — calm, premium, low contrast, not shiny or neon. Keep the medallion
face simple (no emblem, no star, no text). Centered, large, clean, safe
margins. No text, no UI, no card, no border, no square background, no harsh
shadow. Must read as a faint silhouette at 8–14% opacity.
```

- **ملاحظات توليد:** اجعل وجه الميدالية بسيطًا (بدون نجمة حادة كبيرة تزاحم محتوى الكرت).
- **قص/شفافية:** `remove_background` عند الحاجة؛ حافة الشريط ناعمة.

---

## 4) `overlay_child_halo.png`

- **أين يُستخدم:** بطاقات الأطفال في `/parent` و `/parent/children` (خلف الأفاتار).
- **وظيفة الرسمة:** هالة لطيفة حول أفاتار الطفل تعطي إحساس رعاية — **بلا وجه/شخصية**، والمركز مفرّغ.

**Higgsfield Prompt:**
```
A soft circular glowing halo ring with gentle scattered dots and a few tiny
sparkles arranged around an EMPTY center, smooth soft 3D, warm cream and
lavender glow with pale-gold sparkles, the middle of the ring is completely
empty (no face, no character, no child), perfectly centered with generous
margin, transparent background, decorative motif only.
```

**GPT Image 2 Prompt:**
```
Create a soft decorative halo motif on a fully TRANSPARENT background. A gentle
glowing circular halo/ring with soft scattered dots and a few tiny sparkles
around it; the CENTER of the ring must be completely empty (an avatar will sit
there) — absolutely no face, no character, no child, no figure. Colors limited
to warm cream and lavender glow with pale-gold sparkles, calm and soft. Centered
ring, large, clean, safe margins. No text, no UI, no card, no border, no square
background. Must read as a faint halo at 8–14% opacity.
```

- **ملاحظات توليد:** **حرج:** المركز فارغ تمامًا (الأفاتار يوضع فوقه)؛ لا أي وجه أو شخصية طفل.
- **قص/شفافية:** تأكد أن مركز الحلقة شفاف (alpha) لا أبيض.

---

## ملخّص الإخراج المتوقّع

| asset | usage | motif | size | bg | الحالة |
|---|---|---|---|---|---|
| `overlay_wishes_star.png` | أمنياتي (child / wishes) | نجمة أمنية 3D | 1024² | transparent | بانتظار التوليد |
| `overlay_progress_ring.png` | تقدّمي (child / progress) | حلقة تقدّم مفتوحة | 1024² | transparent | بانتظار التوليد |
| `overlay_badge_silhouette.png` | أوسمتي / النقاط | ظل ميدالية | 1024² | transparent | بانتظار التوليد |
| `overlay_child_halo.png` | بطاقات أطفال ولي الأمر | هالة + نقاط (مركز فارغ) | 1024² | transparent | بانتظار التوليد |

**الوجهة لاحقًا:** `public/assets/overlays/`. لم يُولَّد أي أصل، ولم يُطبَّق أي contrast card بعد — هذا pack توثيقي فقط.
