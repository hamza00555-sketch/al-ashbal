# OVERLAY ASSET PROMPTS — Contrast Card Overlays (Phase 2)

> **حالة:** prompt pack فقط — لا توليد، لا تطبيق، لا تعديل كود. يُولَّد لاحقًا عبر
> Higgsfield أو GPT Image 2 ثم يُقصّ شفافًا ويوضع في `public/assets/overlays/`.
>
> **الاتجاه (مُحدَّث):** هذه الأصول **ليست 3D وليست icons وليست illustrations مجسّمة**.
> هي **زخارف overlay مسطّحة (flat) شبيهة بالـ watermark / tattoo-on-card** توضع فوق
> الكرت الفاتح بشفافية منخفضة (opacity ‎0.08–0.14‎). يجب أن تبدو وكأنها **مطبوعة على
> سطح الكرت** — رسمة فلات نظيفة، بلا عمق، بلا بروز، بلا إضاءة واقعية — وتظل
> **soft but clearly readable flat silhouette at 8–14% opacity over cream/off-white cards**.

---

## مواصفات عامة (تنطبق على الأربعة)

- PNG شفاف · **1024×1024** · no background · centered object · safe margins.
- **flat decorative overlay / watermark / clean flat illustration / minimal silhouette.**
- single-layer أو **two-tone كحد أقصى** · ألوان ناعمة جدًا.
- **ممنوع تمامًا:** 3D · clay / matte volumetric render · inner glow قوي · rim light ·
  highlights ثلاثية الأبعاد · material texture · metallic shine · thick / realistic shadow ·
  gradient ثقيل · realistic lighting.
- ممنوع أيضًا: turquoise · mint · cyan · neon · نص · UI · border · background tile · white square · people.
- اللوحة: **purple / lavender / cream / pale gold / very soft peach** فقط — هادئة، غير مشبعة.
- النموذج المقترح: Higgsfield `nano_banana_pro` أو `flux_2` · `aspect_ratio: 1:1` · ثم `remove_background`.

## ملاحظات توليد عامة (لكل الأصول)

- ولّد **خيارين على الأقل** لكل asset — نختار الأفضل بصريًا قبل إدخاله للتطبيق.
- بعد التوليد: **افحص الشفافية والحواف، وتأكد من عدم وجود white halo**، وأن **المظهر فلات** (لا أي إيحاء 3D/لمعان).
- يجب أن تُقرأ الرسمة بوضوح ناعم عند opacity ‎0.08–0.14‎ فوق كرت cream/off-white.

## Negative Prompt موحّد (لكل الأصول)

```
no text, no letters, no logo, no background, no UI card, no phone screen,
no people, no realistic photo, no harsh outlines, no cyan, no turquoise,
no mint, no neon, no clutter, no watermark text, no frame, no square tile background,
no 3D, no clay render, no volumetric shading, no inner glow, no rim light,
no metallic shine, no glossy highlights, no drop shadow, no realistic lighting,
no material texture, no heavy gradient
```

---

## 1) `overlay_wishes_star.png`

- **أين يُستخدم:** كرت "أمنياتي" في `/child` · كروت الأمنيات في `/child/wishes`.
- **وظيفة الرسمة:** watermark زخرفي مسطّح خلف محتوى كرت الأمنيات — نجمة أمنية فلات نظيفة.

**Higgsfield Prompt:**
```
A single flat decorative star, clean minimal flat vector-style illustration,
simple soft fill (cream with a subtle pale-gold or lavender tint, two-tone
maximum), 3 to 5 tiny flat sparkles around it (not crowded), watermark-like
decorative motif that looks printed flat on a surface, NO 3D, no shading, no
glow, no highlights, no depth — a single flat silhouette, centered with generous
margin, plain solid flat light-gray background. No text, no UI, no border.
Colors only cream, pale gold, lavender. No turquoise, no mint, no cyan, no neon,
no metallic, no gradient.
```

**GPT Image 2 Prompt:**
```
Create a single FLAT decorative wish-star watermark on a fully TRANSPARENT
background (alpha, no backdrop). Clean minimal flat vector-style star, one soft
two-tone fill (cream with a subtle pale-gold/lavender tint), with exactly 3 to 5
tiny flat sparkles around it (not crowded). It must look like a flat graphic
printed onto a card surface — absolutely NO 3D, no clay, no volumetric shading,
no inner glow, no rim light, no highlights, no drop shadow. Object centered with
safe margins, large and clean. No text, no UI, no card, no border, no square
background. Soft but clearly readable flat silhouette at 8–14% opacity over
cream/off-white cards.
```

- **ملاحظات توليد:** نجمة مفردة كبيرة، sparkles **3–5 فقط**، مظهر فلات تمامًا (لا لمعان ذهبي).
- **قص/شفافية:** `remove_background` عند الحاجة؛ حواف نظيفة بلا white halo.

---

## 2) `overlay_progress_ring.png`

- **أين يُستخدم:** كرت "تقدّمي" في `/child` · كرت التقدّم في `/child/progress`.
- **وظيفة الرسمة:** watermark مسطّح يدل على التطوّر — حلقة تقدّم فلات مفتوحة، بلا أرقام/chart.

**Higgsfield Prompt:**
```
A single FLAT circular progress ring (open / incomplete arc), clean minimal flat
vector-style, relatively THICK and bold (not thin) so it reads clearly, optional
very small flat upward arrow at the tip, soft two-tone maximum (lavender / pale
purple with one subtle pale-gold flat accent on the arc), watermark-like flat
motif, NO 3D, no shading, no glow, no depth, flat single-layer, centered with
generous margin, plain solid flat light-gray background, no numbers, no chart.
No text, no UI, no border. No turquoise, no mint, no cyan, no neon, no metallic,
no heavy gradient.
```

**GPT Image 2 Prompt:**
```
Create a single FLAT decorative progress-ring watermark on a fully TRANSPARENT
background. One clean flat circular ring that is partially open (~70%), with
rounded flat ends and a small flat upward arrow at the tip. The ring is
relatively THICK and bold (not thin) so it still reads at low opacity. Flat
two-tone maximum: lavender / pale purple with one subtle pale-gold flat accent
on the filled arc. It must look flat/printed — NO 3D, no clay, no volumetric
shading, no inner glow, no rim light, no metallic, no drop shadow. Centered,
large, clean, safe margins. No numbers, no chart, no text, no UI, no card, no
border, no square background. Soft but clearly readable flat silhouette at 8–14%
opacity over cream/off-white cards.
```

- **ملاحظات توليد:** الحلقة مفتوحة، **سُمكها واضح** لتُقرأ عند opacity منخفض؛ السهم صغير وفلات.
- **قص/شفافية:** المركز مفرّغ (شفاف).

---

## 3) `overlay_badge_silhouette.png`

- **أين يُستخدم:** كرت "أوسمتي" في `/child/progress` · كروت الأوسمة/النقاط لاحقًا.
- **وظيفة الرسمة:** silhouette مسطّح لوسام/ميدالية كزخرفة خلف الأوسمة الفعلية.

**Higgsfield Prompt:**
```
A single FLAT medal / badge silhouette, clean minimal flat vector-style, a
simple solid flat medallion shape with a small flat ribbon hint at the bottom,
soft two-tone maximum (pale gold with a gentle lavender flat tint), blank simple
face (no emblem, no large star, no text), watermark-like flat motif, NO 3D, no
metallic, no shine, no shading, no depth, flat single-layer, centered with
generous margin, plain solid flat light-gray background. No text, no UI, no
border. No turquoise, no mint, no cyan, no neon, no metallic, no gradient.
```

**GPT Image 2 Prompt:**
```
Create a single FLAT medal/badge silhouette watermark on a fully TRANSPARENT
background. One simple solid flat medallion shape with a small flat ribbon hint
beneath it. Flat two-tone maximum: pale gold with a gentle lavender flat tint.
Keep the face blank and simple (no emblem, no large star, no text). It must look
flat/printed — NO 3D, no clay, no metallic shine, no glossy highlight, no
volumetric shading, no drop shadow. A clear simple mass that reads at low
opacity. Centered, large, clean, safe margins. No text, no UI, no card, no
border, no square background. Soft but clearly readable flat silhouette at 8–14%
opacity over cream/off-white cards.
```

- **ملاحظات توليد:** كتلة بسيطة واضحة، بلا تفاصيل كثيرة أو نجمة كبيرة، بلا أي metallic.
- **قص/شفافية:** `remove_background` عند الحاجة؛ حافة الشريط فلات.

---

## 4) `overlay_child_halo.png`

- **أين يُستخدم:** بطاقات الأطفال في `/parent` و `/parent/children` (خلف الأفاتار).
- **وظيفة الرسمة:** هالة مسطّحة لطيفة خلف أفاتار الطفل — **بلا وجه/شخصية**، والمركز شفاف بالكامل.

**Higgsfield Prompt:**
```
A FLAT decorative halo ring, clean minimal flat vector-style, a simple thin-to-
medium circular ring with a few very simple flat dots evenly around it, the
center is a fully EMPTY transparent hole (nothing inside, no face, no child, no
character), soft two-tone maximum (lavender and cream with tiny pale-gold flat
dots), watermark-like flat motif, NO 3D, no exaggerated glow, no shading, no
depth, flat single-layer, centered with generous margin, plain solid flat
light-gray background filling the empty center too. No text, no UI, no border.
No turquoise, no mint, no cyan, no neon, no metallic, no heavy glow.
```

**GPT Image 2 Prompt:**
```
Create a FLAT decorative halo watermark on a fully TRANSPARENT background. A
simple flat circular ring with a few very simple flat dots evenly around it; the
CENTER of the ring must be a fully TRANSPARENT empty hole — NOT white and NOT
filled — because a round avatar will sit inside it. Absolutely no face, no child,
no character, no figure, no exaggerated glow. Flat two-tone maximum: lavender and
cream with tiny pale-gold flat dots. It must look flat/printed — NO 3D, no clay,
no volumetric glow, no rim light, no metallic, no drop shadow. Centered ring,
clean, safe margins. No text, no UI, no card, no border, no square background.
Soft but clearly readable flat halo at 8–14% opacity over cream/off-white cards.
```

- **ملاحظات توليد:** **حرج:** المركز **TRANSPARENT** (لا أبيض/رمادي ولا مملوء) لأن الهالة خلف **avatar دائري**؛ لا وجه/طفل/شخصية، ولا glow مبالغ.
- **قص/شفافية:** تأكد أن مركز الحلقة شفاف فعليًا (alpha hole) وأن لا white halo حول الحواف.

---

## ملخّص الإخراج المتوقّع

| asset | usage | motif (flat) | size | bg | الحالة |
|---|---|---|---|---|---|
| `overlay_wishes_star.png` | أمنياتي (child / wishes) | نجمة فلات + 3–5 sparkles | 1024² | transparent | بانتظار التوليد النهائي |
| `overlay_progress_ring.png` | تقدّمي (child / progress) | حلقة تقدّم فلات مفتوحة سميكة | 1024² | transparent | بانتظار التوليد النهائي |
| `overlay_badge_silhouette.png` | أوسمتي / النقاط | silhouette ميدالية فلات | 1024² | transparent | بانتظار التوليد النهائي |
| `overlay_child_halo.png` | بطاقات أطفال ولي الأمر | هالة فلات + نقاط (مركز شفاف) | 1024² | transparent | بانتظار التوليد النهائي |

**الوجهة لاحقًا:** `public/assets/overlays/`. الاتجاه الآن **flat decorative overlay** (لا 3D). لم يُولَّد أي أصل نهائي، ولم يُطبَّق أي contrast card بعد — هذا pack توثيقي فقط.
