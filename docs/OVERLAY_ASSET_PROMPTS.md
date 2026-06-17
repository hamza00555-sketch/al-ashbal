# OVERLAY ASSET PROMPTS — Contrast Card Overlays (Phase 2)

> **حالة:** prompt pack فقط — لا توليد، لا تطبيق، لا تعديل كود. تُولَّد لاحقًا عبر
> Higgsfield و GPT Image 2 ثم تُقصّ شفافة وتوضع في `public/assets/overlays/`.
>
> **الاتجاه (مُشدَّد):** هذه زخارف **flat 2D vector watermark** فقط — كأنها **tattoo
> مطبوع على سطح كرت cream/off-white**. ليست icons مستقلة، وليست illustrations.
> توضع فوق الكرت بشفافية ‎0.08–0.14‎ ويجب أن تُقرأ بوضوح ناعم عند تلك الشفافية.

---

## الاتجاه البصري الصحيح (استخدم هذه المفردات)

`flat vector` · `stencil` · `watermark` · `tattoo on card` · `printed graphic` ·
`2D silhouette` · `single-color or two-tone maximum` · `transparent PNG`.

## ممنوع تمامًا في كل برومبت (مفردات تُحدث 3D)

`3D` · `soft 3D` · `cute 3D` · `clay` · `render` · `realistic lighting` · `bevel` ·
`emboss` · `depth` · `shadow` · `glow` · `volume` · `material` · `matte object` ·
`illustration object` · `icon with depth` · وكلمة `object` نفسها.

## الجملة العامة (ضعها حرفيًا في بداية كل برومبت)

```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
```

## Negative Prompt موحّد (استخدمه في كل الأصول)

```
no 3D, no render, no clay, no depth, no bevel, no emboss, no shadow, no drop
shadow, no glow, no rim light, no realistic lighting, no material texture, no
metallic shine, no glossy highlights, no photo, no realistic object, no
background, no card mockup, no UI, no phone, no text, no letters, no logo, no
watermark text, no frame, no square tile, no cyan, no turquoise, no mint, no
neon, no clutter
```

## مواصفات الإخراج + ملاحظات توليد

- PNG شفاف · **1024×1024** · centered · safe margins · بلا خلفية/إطار/بلاطة بيضاء.
- اللوحة: **purple / lavender / cream / pale gold** (+ very soft peach عند الحاجة) —
  single-color أو two-tone كحد أقصى · بلا gradients إلا tint فلات خفيف جدًا عند الضرورة.
- ولّد **خيارين على الأقل** لكل أصل · بعد التوليد **افحص الشفافية والحواف وعدم وجود white halo**،
  و**ارفض أي ناتج فيه أي إيحاء عمق/ظل/لمعان** · استخدم `remove_background` إن ظهرت خلفية.

---

## 1) `overlay_wishes_star.png`

- **أين يُستخدم:** كرت "أمنياتي" في `/child` · كروت الأمنيات في `/child/wishes`.
- **الوظيفة:** watermark فلات لنجمة أمنية.

**Higgsfield Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A flat 2D vector-style wish star watermark, simple five-point rounded star, 3 to
5 tiny flat sparkles, stencil-like, printed-on-card feeling, single-color or
two-tone lavender and pale gold, centered with safe margins, transparent
background, readable at 8–14% opacity.
```

**GPT Image 2 Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A simple five-point rounded star as a flat stencil-like watermark with exactly
3 to 5 tiny flat sparkles around it. Single-color or two-tone maximum (lavender
and pale gold flat tint). Centered, clean, generous safe margins. Fully
transparent background. No text, no UI, no border, no square background. Must
stay clearly readable at 8–14% opacity over cream/off-white cards.
```

- **ملاحظات:** نجمة مفردة + 3–5 sparkles فقط · فلات تمامًا · `remove_background` عند الحاجة، بلا white halo.

---

## 2) `overlay_progress_ring.png`

- **أين يُستخدم:** كرت "تقدّمي" في `/child` · كرت التقدّم في `/child/progress`.
- **الوظيفة:** watermark فلات لحلقة تقدّم.

**Higgsfield Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A flat 2D vector-style circular progress ring watermark, open incomplete ring,
thick readable stroke, optional tiny upward arrow integrated into the ring,
stencil-like decorative graphic, lavender / muted purple with optional pale gold
accent, centered with safe margins, transparent background, no numbers, no
chart, readable at 8–14% opacity.
```

**GPT Image 2 Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
An open, incomplete circular progress ring as a flat stencil-like watermark with
a thick readable stroke (not thin) and a tiny flat upward arrow integrated at
the tip. Two-tone maximum: lavender / muted purple with one optional pale-gold
flat accent on the arc. No numbers, no chart. Centered, clean, generous safe
margins. Fully transparent background (the ring center stays empty). No text, no
UI, no border, no square background. Must stay clearly readable at 8–14%
opacity.
```

- **ملاحظات:** حلقة مفتوحة سميكة تُقرأ عند opacity منخفض · المركز مفرّغ · فلات بلا أي تظليل.

---

## 3) `overlay_badge_silhouette.png`

- **أين يُستخدم:** كرت "أوسمتي" في `/child/progress` · كروت الأوسمة/النقاط لاحقًا.
- **الوظيفة:** silhouette فلات لوسام/ميدالية.

**Higgsfield Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A flat 2D vector-style medal badge silhouette watermark, simple rounded
medallion shape with a small ribbon hint, clean solid mass, no inner emblem, no
text, no large star, stencil-like printed graphic, muted lavender and pale gold
two-tone maximum, centered with safe margins, transparent background, readable
at 8–14% opacity.
```

**GPT Image 2 Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A simple rounded medallion shape with a small flat ribbon hint as a flat
stencil-like watermark — a clean solid mass with a blank face (no inner emblem,
no large star, no text). Two-tone maximum: muted lavender and pale gold flat
tint, no metallic, no shine. Centered, clean, generous safe margins. Fully
transparent background. No text, no UI, no border, no square background. Must
stay clearly readable at 8–14% opacity.
```

- **ملاحظات:** كتلة بسيطة واضحة · بلا تفاصيل/نجمة كبيرة/لمعان معدني · فلات تمامًا.

---

## 4) `overlay_child_halo.png`

- **أين يُستخدم:** بطاقات الأطفال في `/parent` و `/parent/children` (خلف الأفاتار).
- **الوظيفة:** هالة فلات خلف أفاتار الطفل — بلا وجه/شخصية، والمركز شفاف بالكامل.

**Higgsfield Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A flat 2D vector-style circular halo watermark, empty transparent center for a
circular avatar, simple ring with a few flat dots and tiny sparkles around it,
no face, no child, no character, stencil-like printed-on-card feeling, muted
lavender / cream / pale gold, centered with safe margins, transparent
background, readable at 8–14% opacity.
```

**GPT Image 2 Prompt:**
```
Create a flat 2D vector-style decorative watermark motif, like a subtle tattoo
printed on a cream/off-white card. Transparent PNG. No 3D, no depth, no shadow,
no glow, no render, no material texture. The shape should be readable when used
at 8–14% opacity.
A simple flat circular halo ring with a few flat dots and tiny sparkles evenly
around it. The CENTER must be a fully TRANSPARENT empty hole (a round avatar
will sit inside) — not white, not filled. Absolutely no face, no child, no
character. Two-tone maximum: muted lavender / cream with tiny pale-gold flat
dots. Centered, clean, generous safe margins. Fully transparent background. No
text, no UI, no border, no square background. Must stay clearly readable at
8–14% opacity.
```

- **ملاحظات:** **حرج:** المركز **TRANSPARENT** (لا أبيض/مملوء) لأن الهالة خلف avatar دائري · بلا وجه/طفل · فلات تمامًا · تأكد لا white halo.

---

## ملخّص الإخراج المتوقّع

| asset | usage | motif | size | bg | الحالة |
|---|---|---|---|---|---|
| `overlay_wishes_star.png` | أمنياتي (child / wishes) | flat star + 3–5 sparkles | 1024² | transparent | بانتظار التوليد |
| `overlay_progress_ring.png` | تقدّمي (child / progress) | flat open progress ring | 1024² | transparent | بانتظار التوليد |
| `overlay_badge_silhouette.png` | أوسمتي / النقاط | flat medal silhouette | 1024² | transparent | بانتظار التوليد |
| `overlay_child_halo.png` | بطاقات أطفال ولي الأمر | flat halo + dots (مركز شفاف) | 1024² | transparent | بانتظار التوليد |

**الوجهة لاحقًا:** `public/assets/overlays/`. الاتجاه **flat 2D vector watermark** (لا أي 3D). لم يُولَّد أي أصل، ولم يُطبَّق أي contrast card — توثيق فقط.
