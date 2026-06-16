# VISUAL ASSET STYLE LOCK — الأشبال

> الغرض: تثبيت اتجاه بصري **واحد** لكل أصول التطبيق قبل الإنتاج الكبير، بحيث تبدو
> كل الأصول من **عائلة واحدة**. هذا الملف هو المرجع الأعلى لأي توليد لاحق.
>
> **الحالة: Style Lock v2 — "Soft 3D Cute" (يستبدل v1 الـ flat).** دفعة الاختبار
> الأولى (flat) **ملغاة بصريًا**؛ الاتجاه المعتمد الآن هو 3D اللطيف الموصوف أدناه.

---

## A. New Art Direction — Soft 3D Cute

نظام **soft 3D cute illustration** موحّد:

- **Soft 3D / cute clay-like render** — أشكال مجسّمة ناعمة، أحجام واضحة، إحساس
  مادي لطيف (clay/matte)، لعبوي لكنه راقٍ (toy-like but premium).
- **Rounded forms** — كل شيء مدوّر الحواف، بلا زوايا حادة، silhouette بسيط واضح.
- **Smooth surfaces + gentle lighting** — إضاءة ناعمة موحّدة (من الأعلى تقريبًا)،
  تدرّج خفيف على السطح يعطي حجمًا، **بلا انعكاسات لامعة قوية**.
- **Subtle depth + soft shadow** — ظل تماس ناعم تحت العنصر (contact shadow) أو
  هالة توهّج بنفسجي خفيفة، عمق بسيط لا أكثر.
- **Purple-led identity** — البنفسجي يقود كل أصل، مع لمسات ذهبي/منت/كورال دافئة.
- **Clean material-like look** — مواد نظيفة موحّدة (matte plastic/clay) عبر كل
  الأصول لتبدو من نفس النظام.
- **Minimal but expressive** — عنصر/عنصران واضحان، شخصية لطيفة، بلا ازدحام.
- **Friendly educational, calm & warm** — منتج عائلي تعليمي قرآني هادئ ومطمئن.

كلمة مفتاحية موحّدة (تُلصق في كل برومبت):
> *cute soft 3D render, rounded clay-like forms, smooth matte surfaces, gentle
> soft studio lighting, subtle depth, soft contact shadow, premium toy-like
> educational app asset, purple-first, minimal, very clear silhouette.*

> نريد 3D **واضحًا وبسيطًا ولطيفًا** — وليس واقعيًا ولا 3D ثقيلًا رخيصًا.

---

## B. Color System (مقفول على هوية التطبيق — لا يتغيّر)

المصدر الوحيد: `tokens/brand-tokens.css`.

| الدور | الاسم | HEX | الاستخدام |
|---|---|---|---|
| Night purple | `--color-night-purple` | `#0D0820` | أعمق نقطة في الخلفيات |
| Deep purple (Dark) | `--color-deep-purple` | `#1A1038` | الخلفية الأساسية |
| Royal purple | `--color-royal-purple` | `#2B1763` | أجسام/قواعد داكنة |
| Panel purple | `--color-panel-purple` | `#3A207C` | تدرّج/أسطح متوسطة |
| **Primary purple** | `--color-main-purple` | `#6D4CFF` | اللون الأساسي للأجسام |
| Soft purple | `--color-soft-purple` | `#9F84FF` | إضاءة/أكسنت ناعم |
| Light lavender | `--color-lavender-mist` | `#D8CCFF` | highlights/أسطح فاتحة |
| Soft cream / white | `--color-warm-white` | `#FFF8EA` | لمسات إضاءة محدودة |
| Accent gold | `--color-badge-gold` | `#F6C65B` | الأوسمة والإنجازات فقط |
| Accent mint | `--color-success-mint` | `#63D9A0` | النجاح/القبول |
| Accent coral | `--color-alert-coral` | `#F97373` | تنبيه/رفض لطيف فقط |

قاعدة اللون: الجسم بنفسجي بدرجاته، الإضاءة soft purple/lavender، اللمسات الدافئة
(ذهبي/منت/كورال) بحدود. الخلفيات بتدرّج بنفسجي عميق هادئ.

---

## C. Shape Language

مفردات شكلية مجسّمة موحّدة:

- كرات/دوائر مجسّمة وحلقات ناعمة (Progress rings ثلاثية الأبعاد لطيفة).
- نجوم مجسّمة بسيطة (puffy star) بحواف مدوّرة.
- شارات/ميداليات مدوّرة بعمق خفيف (3D medal).
- كتب/مصاحف مجرّدة مجسّمة (كتاب مفتوح puffy، بلا حروف).
- شخصيات لطيفة مجسّمة (شبل/طفل/معلم) برؤوس كبيرة وملامح **رمزية** بسيطة.
- أقواس وموجات صوت ناعمة مجسّمة.
- إيحاء حلقة تعليمية غير مباشر (هلال puffy، نجمة) بلا أي رمز ديني ثقيل.

---

## D. What to avoid (صارم)

- ❌ **flat icon look** أو generic vector style (انتهى اتجاه v1 الـ flat).
- ❌ **أجسام غامضة** لا تُفهم فورًا (انظر قاعدة الوضوح).
- ❌ نص داخل الأصول (لا عربي/إنجليزي)، أرقام، أو خط زخرفي.
- ❌ وجوه واقعية أو ملامح بشرية تفصيلية؛ الشخصيات رمزية لطيفة.
- ❌ صور فوتوغرافية أو textures واقعية.
- ❌ 3D ثقيل/واقعي، لمعان بلاستيكي قوي، انعكاسات حادة، أو رندر مفرط التفاصيل.
- ❌ رموز دينية حسّاسة (آيات مكتوبة، مساجد مفصّلة، أشخاص في وضع عبادة).
- ❌ تكوين مزدحم أو خلفيات مشغولة.
- ❌ اختلاف الستايل/المادة/الإضاءة بين الأصول (يجب أن تبدو عائلة واحدة).

---

## E. Asset Clarity Rule

> **كل أصل يجب أن يُفهم خلال ثانيتين.** إذا لم يدرك المشاهد ما هو الأصل فورًا،
> فهو أصل **فاشل** ويُعاد تصميمه — لا نُكمل الإنتاج على أصل غامض.

معايير الوضوح: silhouette بسيط، عنصر رئيسي واحد مركزي، تباين كافٍ مع الخلفية،
رمز مألوف، ويبقى مقروءًا عند 24–32px (للأيقونات) وعند الأحجام الصغيرة عمومًا.

---

## F. Output & Pipeline

- **الأصول الصغيرة** (icons / badges / avatars / small illustrations / empty-state
  objects): **transparent PNG، مقصوصة، حواف نظيفة، بلا هالة matte** — وفق
  `docs/TRANSPARENT_ASSET_PIPELINE.md` (توليد ثم background removal تلقائي).
- **الخلفيات**: مشهد كامل **غير شفاف**، بلا قص.
- الحفظ في `assets/generated/<category>/` بأسماء `docs/ASSET_INVENTORY.md`.
- كل توليد يمرّ عبر `docs/HIGGSFIELD_PROMPT_PACK.md` (نسخة 3D).
