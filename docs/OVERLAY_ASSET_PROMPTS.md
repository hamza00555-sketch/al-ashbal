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
- شكل **soft defined silhouette with gentle internal shading** يبقى **soft but clearly readable silhouette at 8–14% opacity over cream/off-white cards** (تجنّب وصف "low contrast" حتى لا تختفي الرسمة).
- النموذج المقترح: Higgsfield `nano_banana_pro` أو `flux_2` · `aspect_ratio: 1:1` · ثم `remove_background`.

## ملاحظات توليد عامة (لكل الأصول)

- ولّد **خيارين على الأقل** لكل asset — نختار الأفضل بصريًا قبل إدخاله للتطبيق.
- بعد التوليد: **افحص الشفافية والحواف، وتأكد من عدم وجود white halo** حول الشكل.
- الرسمة ليست باهتة: يجب أن تُقرأ بوضوح ناعم عند opacity ‎0.08–0.14‎ فوق كرت cream/off-white.

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
glow with 3 to 5 small soft sparkles nearby (not more, not crowded), soft warm
cream and pale gold body with a faint lavender rim light, soft defined
silhouette with gentle internal shading, rounded friendly premium shape (not
childish), perfectly centered with generous margin, transparent background,
decorative motif only.
```

**GPT Image 2 Prompt:**
```
Create a single decorative wish-star motif on a fully TRANSPARENT background
(alpha, no backdrop). One large soft 3D five-point star, smooth matte clay
finish, gentle inner glow and exactly 3 to 5 small soft sparkles around it (not
crowded). Colors limited to warm cream and pale gold with a subtle lavender edge
light — calm and premium, not neon, not bright gold. A soft defined silhouette
with gentle internal shading. Object centered with safe margins, large and
clean. No text, no letters, no UI, no card, no border, no square background, no
ground shadow. Soft but clearly readable silhouette at 8–14% opacity over
cream/off-white cards.
```

- **ملاحظات توليد:** أبقِ النجمة مفردة وكبيرة، وعدد الـ sparkles **3–5 فقط** (لا أكثر، غير مزدحمة).
- **قص/شفافية:** لو خرج على خلفية مصمتة → `remove_background`. تأكد أن الحواف ناعمة بلا هالة بيضاء.

---

## 2) `overlay_progress_ring.png`

- **أين يُستخدم:** كرت "تقدّمي" في `/child` · كرت التقدّم في `/child/progress`.
- **وظيفة الرسمة:** watermark يدل على التطوّر — حلقة تقدّم/مسار صاعد، لا chart ولا أرقام.

**Higgsfield Prompt:**
```
A single soft 3D circular progress ring (an open, incomplete ring), relatively
THICK and bold (not thin) so it clearly reads as a progress ring, with a small
gentle upward arrow softly integrated into the ring, smooth matte 3D render,
soft defined silhouette with gentle internal shading, lavender and pale purple
body with a subtle pale-gold accent on the progress arc, rounded soft ends,
perfectly centered with generous margin, transparent background, no numbers, no
chart, decorative motif only.
```

**GPT Image 2 Prompt:**
```
Create a single decorative progress-ring motif on a fully TRANSPARENT
background. One soft 3D circular ring that is partially open (like circular
progress ~70%), with rounded soft ends and a small gentle upward arrow blended
softly into it. The ring is relatively THICK and bold (not thin) so it still
reads as a progress ring at low opacity. Colors limited to lavender / pale
purple with one subtle pale-gold accent on the filled arc. Calm, premium, soft
3D, soft defined silhouette with gentle internal shading — no neon. Centered,
large, clean, with safe margins. No numbers, no chart, no text, no UI, no card,
no border, no square background. Soft but clearly readable silhouette at 8–14%
opacity over cream/off-white cards.
```

- **ملاحظات توليد:** الحلقة مفتوحة (ناقصة) لإيحاء التقدّم، و**سُمكها واضح (سميكة نسبيًا)** لتُقرأ كحلقة تقدّم حتى عند opacity منخفض؛ السهم مدمج بنعومة لا منفصل.
- **قص/شفافية:** المركز يبقى مفرّغًا (شفاف) — مفيد لو وُضع محتوى فوقه.

---

## 3) `overlay_badge_silhouette.png`

- **أين يُستخدم:** كرت "أوسمتي" في `/child/progress` · كروت الأوسمة/النقاط لاحقًا.
- **وظيفة الرسمة:** ظل وسام/ميدالية زخرفي خلف الأوسمة الفعلية.

**Higgsfield Prompt:**
```
A single soft defined medal silhouette, soft 3D smooth matte render, simple
rounded medallion with a clear solid mass and a small soft ribbon hint at the
bottom, pale gold body with soft lavender shading and gentle internal shading,
calm and premium (not shiny, not neon), no central emblem detail, no text, no
large star inside, perfectly centered with generous margin, transparent
background, decorative watermark motif only.
```

**GPT Image 2 Prompt:**
```
Create a single soft defined medal silhouette on a fully TRANSPARENT
background. One simple rounded medallion with a clear solid mass and a small
soft ribbon hint beneath it, soft 3D matte finish. Colors limited to pale gold
with gentle lavender shading and soft internal shading — calm, premium, not
shiny or neon. Keep the medallion face simple (no emblem, no large star, no
text). Centered, large, clean, safe margins. No text, no UI, no card, no
border, no square background, no harsh shadow. Soft but clearly readable
silhouette at 8–14% opacity over cream/off-white cards.
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
sparkles arranged around an EMPTY center, soft defined glow with gentle internal
shading, smooth soft 3D, warm cream and lavender glow with pale-gold sparkles,
the middle of the ring is a fully TRANSPARENT alpha hole (NOT white, not filled)
so it sits behind a round/circular avatar, no face, no child, no character,
perfectly centered with generous margin, transparent background, decorative
motif only.
```

**GPT Image 2 Prompt:**
```
Create a soft decorative halo motif on a fully TRANSPARENT background. A gentle
glowing circular halo/ring with soft scattered dots and a few tiny sparkles
around it; the CENTER of the ring must be a fully TRANSPARENT alpha hole — NOT
white and NOT filled — because a round/circular avatar will sit inside it.
Absolutely no face, no character, no child, no figure. Colors limited to warm
cream and lavender glow with pale-gold sparkles, calm and soft, a soft defined
halo with gentle internal shading. Centered ring, large, clean, safe margins.
No text, no UI, no card, no border, no square background. Soft but clearly
readable halo at 8–14% opacity over cream/off-white cards.
```

- **ملاحظات توليد:** **حرج:** المركز **TRANSPARENT alpha** (لا أبيض ولا مملوء) لأن الهالة تعمل **خلف avatar دائري**؛ لا وجه، لا طفل، لا شخصية.
- **قص/شفافية:** تأكد أن مركز الحلقة شفاف فعليًا (alpha hole) لا أبيض، وأن لا white halo حول الحواف.

---

## ملخّص الإخراج المتوقّع

| asset | usage | motif | size | bg | الحالة |
|---|---|---|---|---|---|
| `overlay_wishes_star.png` | أمنياتي (child / wishes) | نجمة أمنية 3D | 1024² | transparent | بانتظار التوليد |
| `overlay_progress_ring.png` | تقدّمي (child / progress) | حلقة تقدّم مفتوحة | 1024² | transparent | بانتظار التوليد |
| `overlay_badge_silhouette.png` | أوسمتي / النقاط | ظل ميدالية | 1024² | transparent | بانتظار التوليد |
| `overlay_child_halo.png` | بطاقات أطفال ولي الأمر | هالة + نقاط (مركز فارغ) | 1024² | transparent | بانتظار التوليد |

**الوجهة لاحقًا:** `public/assets/overlays/`. لم يُولَّد أي أصل، ولم يُطبَّق أي contrast card بعد — هذا pack توثيقي فقط.
