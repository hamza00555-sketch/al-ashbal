# OVERLAY ASSET PROMPTS — Contrast Card Overlays (Phase 2)

> **حالة:** prompt pack فقط — لا توليد، لا تطبيق، لا تعديل كود. تُولَّد عبر Higgsfield و
> GPT Image 2 ثم تُقصّ شفافة وتوضع في `public/assets/overlays/`.
>
> **الاتجاه النهائي (إلزامي):** **Minimal flat curved decorative overlay** — وليس
> 3D decorative asset. زخرفة watermark خفيفة كأنها **tattoo / motif مطبوع على سطح
> الكرت cream/off-white**، توضع بشفافية ‎0.08–0.14‎.

---

## القاعدة الحاسمة

```
curvier + flatter + simpler + less detailed
```

- flat 2D فقط · حواف **منحنية وناعمة** · أشكال **مبسّطة جدًا** · **أقل تفاصيل ممكنة**.
- لو في sparkles/dots → **قليلة جدًا**. star / ring / badge / halo → واضحة لكن **بسيطة جدًا**.
- يجب أن تبقى مقروءة عند شفافية منخفضة فوق الكرت — decorative خفيف وراقٍ، لا عنصر أساسي مزعج.
- **إن صار الناتج: مجسّمًا · لامعًا · فيه عمق · فيه تظليل · غنيًا بالتفاصيل · مزخرفًا زيادة → فهذا اتجاه خاطئ ويُرفض.**

## المفردات المسموحة

`flat vector` · `stencil` · `watermark` · `tattoo on card` · `printed motif` ·
`2D silhouette` · `curved` · `simple` · `minimal` · `single-color or two-tone maximum`.

## ممنوع تمامًا في كل برومبت

`3D` · `soft 3D` · `cute 3D` · `clay` · `render` · `realistic` · `bevel` · `emboss` ·
`depth` · `shadow` · `glow` · `highlight` · `inner shading` · `lighting` · `volume` ·
`material` · `texture` · `glossy` · `metallic` · `complex detailing` · `clutter` ·
`object` · `rich illustration` · `detailed artwork`.

## الجملة العامة (ضعها حرفيًا في بداية كل برومبت)

```
Create a minimal flat 2D curved decorative watermark motif, like a simple tattoo
printed on a cream/off-white card. Keep it curvy, simple and minimal with as few
details as possible. This is a flat printed motif, NOT a 3D decorative asset.
Transparent PNG. No 3D, no depth, no shadow, no glow, no highlight, no inner
shading, no render, no gradient, no material texture. The shape must stay
readable at 8–14% opacity.
```

## Negative Prompt موحّد (استخدمه في كل الأصول)

```
no 3D, no render, no clay, no depth, no bevel, no emboss, no shadow, no drop
shadow, no glow, no highlight, no inner shading, no lighting, no realistic
lighting, no material, no texture, no glossy, no metallic shine, no gradient, no
photo, no realistic, no complex detailing, no rich illustration, no detailed
artwork, no clutter, no background, no card mockup, no UI, no phone, no text, no
letters, no logo, no frame, no square tile, no people, no cyan, no turquoise, no
mint, no neon
```

## مواصفات الإخراج + ملاحظات توليد

- PNG شفاف · **1024×1024** · centered · safe margins · بلا خلفية/إطار/بلاطة بيضاء.
- اللوحة: **purple / lavender / cream / pale gold** (+ very soft peach عند الحاجة) —
  single-color أو two-tone فقط · بلا أي gradient (إلا tint فلات خفيف جدًا عند الضرورة القصوى).
- ولّد **خيارين على الأقل** لكل أصل · بعد التوليد افحص الشفافية والحواف وعدم وجود white halo،
  و**ارفض أي ناتج فيه أي إيحاء عمق/ظل/لمعان/تفاصيل كثيرة**.

---

## 1) `overlay_wishes_star.png` — ✅ معتمد (Option A، flat)

- **الاستخدام:** كرت "أمنياتي" في `/child` · كروت الأمنيات في `/child/wishes`.
- **منطق البرومبت (للتوليد المستقبلي إن لزم):**
  `a very simple flat curved five-point rounded star, minimal, only 2 to 3 tiny
  flat sparkles, single-color or two-tone lavender and pale gold, stencil/tattoo
  look, transparent background.`

---

## 2) `overlay_progress_ring.png`

- **الاستخدام:** كرت "تقدّمي" في `/child` · كرت التقدّم في `/child/progress`.

**Higgsfield / GPT Image 2 (الجملة العامة + هذا المنطق):**
```
a very simple flat curved circular progress ring, open/incomplete arc, smooth
thick rounded band (not thin), minimal — optional one tiny simple flat arrow at
the tip or none, single-color or two-tone (lavender / muted purple with a soft
pale-gold flat accent), stencil/tattoo look, empty center, no numbers, no chart,
centered with safe margins, transparent background, readable at 8–14% opacity.
```

- **ملاحظات:** حلقة منحنية بسيطة جدًا، band سميك ناعم، بلا أي تظليل/عمق.

---

## 3) `overlay_badge_silhouette.png`

- **الاستخدام:** كرت "أوسمتي" في `/child/progress` · كروت الأوسمة/النقاط لاحقًا.

**Higgsfield / GPT Image 2 (الجملة العامة + هذا المنطق):**
```
a very simple flat curved medal/badge silhouette, one smooth rounded medallion
shape with a tiny simple flat ribbon hint, blank face (no inner emblem, no star,
no text), minimal with as few details as possible, single-color or two-tone
(pale gold with a gentle lavender flat tint), stencil/tattoo look, no metallic,
centered with safe margins, transparent background, readable at 8–14% opacity.
```

- **ملاحظات:** كتلة منحنية بسيطة جدًا، بلا تفاصيل أو لمعان معدني.

---

## 4) `overlay_child_halo.png`

- **الاستخدام:** بطاقات الأطفال في `/parent` و `/parent/children` (خلف الأفاتار).

**Higgsfield / GPT Image 2 (الجملة العامة + هذا المنطق):**
```
a very simple flat curved circular halo ring with very few small flat dots (3 to
4 only) around it, the CENTER is a fully transparent empty hole (a round avatar
sits inside) — not white, not filled, no face, no child, no character, minimal,
single-color or two-tone (lavender / cream with tiny pale-gold flat dots),
stencil/tattoo look, centered with safe margins, transparent background, readable
at 8–14% opacity.
```

- **ملاحظات:** **حرج:** المركز شفاف بالكامل (لا أبيض/رمادي) · حلقة منحنية بسيطة جدًا · نقاط قليلة جدًا.

---

## ملخّص الإخراج المتوقّع

| asset | usage | motif (minimal flat curved) | size | bg | الحالة |
|---|---|---|---|---|---|
| `overlay_wishes_star.png` | أمنياتي (child / wishes) | flat curved star + 2–3 sparkles | 1024² | transparent | ✅ معتمد — Option A |
| `overlay_progress_ring.png` | تقدّمي (child / progress) | flat curved open ring | 1024² | transparent | بانتظار التوليد بالاتجاه الجديد |
| `overlay_badge_silhouette.png` | أوسمتي / النقاط | flat curved medal silhouette | 1024² | transparent | بانتظار التوليد بالاتجاه الجديد |
| `overlay_child_halo.png` | بطاقات أطفال ولي الأمر | flat curved halo + few dots (مركز شفاف) | 1024² | transparent | بانتظار التوليد بالاتجاه الجديد |

## المعتمد حتى الآن
- **`overlay_wishes_star.png`** ← Option A (flat، بدون stroke):
  `https://d8j0ntlcm91z4.cloudfront.net/user_3E1uwg09F9UoCSTlAoXJKL9reW5/hf_20260617_164709_424a1376-9ae8-4f2a-bba3-4321732c27d2.png`

**الاتجاه الموحّد الآن: `curvier + flatter + simpler + less detailed`.** لم يُطبَّق أي contrast card بعد — توثيق فقط.
