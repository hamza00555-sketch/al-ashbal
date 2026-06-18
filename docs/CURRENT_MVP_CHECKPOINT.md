# نقطة تثبيت الـ MVP الحالية — Current MVP Checkpoint

> ملف توثيق فقط. لا يغيّر UI ولا CSS ولا منطقًا ولا بيانات.
> الغرض: تثبيت الحالة الحالية للتطبيق كنقطة مستقرة قبل الدخول في المراحل القادمة.

تاريخ التثبيت: **2026-06-17**

---

## 1. Current Stable Commit

- **Branch:** `claude/pensive-hypatia-k6qnf3`
- **Latest commit (stable):** `f283ff3` — `style(progress): improve badges and points icon scale`
- **Local tag:** `mvp-ui-stable-2026-06-17` → يشير إلى `f283ff3`
  - ملاحظة: الـ tag محلي فقط ولم يُدفع (دفع الـ tags محظور بصلاحيات البيئة الحالية). الاعتماد الأساسي للرجوع هو **commit hash**.

### آخر أهم commits في هذه المرحلة

| Hash | الوصف |
|------|-------|
| `f283ff3` | style(progress): improve badges and points icon scale |
| `c05ddfe` | style(ui): polish cards icons and review ordering |
| `fbcd9c7` | fix(assets): resolve missing child page asset |
| `52768fb` | style(cards): polish temporary contrast cards |
| `43fa4ce` | style(cards): add temporary contrast card overlays |
| `255ad0a` | docs: enforce minimal flat curved overlay direction |
| `312da6b` | docs: approve overlay_wishes_star Option A (flat, no stroke) |
| `8a40166` | style(badges): improve status readability |

حالة التحقق وقت التثبيت:
- `npm run build` → ✅ ناجح (Compiled successfully)
- `npm run lint` → ✅ ناجح
- Smoke test لـ 13 مسارًا أساسيًا → ✅ كلها `200`
- شجرة العمل نظيفة (لا تغييرات معلّقة).

---

## 2. What Works Now

تعمل حاليًا كنماذج تفاعلية (prototype) على بيانات demo:

- **child dashboard** (`/child`): لوحة الطفل تُعرض بدون أخطاء، تنقّل سفلي يعمل.
- **child tasks** (`/child/tasks`): قائمة المهام مع كروت أنظف (أيقونة كبيرة + سطر meta هادئ)، وترتيب active-first.
- **recording flow demo**: تسجيل صوت/فيديو تجريبي → إرسال → ينتظر موافقة ولي الأمر (منطق التدفق يعمل؛ التقاط الميديا الحقيقي يحتاج جهازًا فعليًا).
- **parent approvals** (`/parent/approvals`): مراجعة وموافقة/إعادة، مع فصل المعلّق عن المُعالَج.
- **teacher reviews** (`/teacher/reviews`): قبول/إعادة/ملاحظة، مع ترتيب pending أولًا ثم الأحدث أولًا داخل كل مجموعة.
- **attendance gate** (`/teacher/attendance` + `/child/lessons`): بوابة الحضور — مفتوحة تسجّل، مغلقة تمنع التسجيل مع رسالة واضحة.
- **teacher prep assignments** (`/teacher/prep`): التحضير وتكليفات الطلاب (متجر مستقل)، تظهر للطفل عند التفعيل وتختفي عند الإغلاق.
- **progress / wishes** (`/child/progress`, `/child/wishes`): حلقات التقدّم، النقاط، الأوسمة (وسام 80px + اسم)، والأمنيات (إضافة محلية فقط).
- **temporary contrast cards**: كروت كريمية مؤقتة مع watermark إنلاين-SVG مسطّح (placeholder حتى وصول overlays النهائية).
- **active-first sorting**: في مهام الطفل ومراجعات المعلم.
- **mobile nav / icons / avatars**: شريط سفلي موحّد، نظام `AppAssetIcon` للأيقونات، وأفاتارات حسب الدور/الطفل.

---

## 3. Known Limitations

بصراحة، الحدود الحالية:

- **البيانات ما زالت demo/localStorage** (+ IndexedDB للتسجيلات) — لا تخزين دائم على خادم.
- **التسجيل الحقيقي يحتاج اختبارًا على جهاز فعلي** — التقاط الكاميرا/المايك لا يمكن التحقق منه بالكامل في بيئة headless.
- **لا يوجد backend/auth حقيقي بعد** — الأدوار والمستخدمون من بيانات seed، لا تسجيل دخول فعلي.
- **الإشعارات حاليًا ليست production push notifications** — مجرد متجر إشعارات داخل المتصفح (localStorage)، لا Web Push / FCM.
- **overlays النهائية مؤجلة بسبب رصيد التوليد** — الـ overlays الحالية مسطّحة مؤقتة (SVG inline)؛ استبدالها بـ PNG النهائية مؤجل حتى توفّر رصيد التوليد.

---

## 4. Next Recommended Phases

المراحل المقترحة بالترتيب:

1. **Real mobile QA** — اختبار فعلي على أجهزة (تسجيل، حضور، تنقّل، RTL، أداء الشريط السفلي).
2. **Backend/auth decision** — اختيار المزوّد (Firebase / Supabase) وطريقة المصادقة والأدوار.
3. **Data model** — تصميم نموذج البيانات الرسمي (children, halaqas, lessons, recitations, reviews, attendance, points, wishes…).
4. **Replace localStorage gradually** — استبدال متاجر الـ demo بمصادر حقيقية متجرًا تلو الآخر دون كسر الواجهة.
5. **Notifications** — إشعارات حقيقية (push) مع احترام قاعدة الخصوصية (parent-controlled).
6. **Production readiness** — أمان، صلاحيات حسب الدور، اختبارات، أداء، نشر.

---

## 5. Rollback Notes

كيفية الرجوع لهذه الحالة المستقرة لو خرب شيء لاحقًا:

- **نقطة الرجوع المعتمدة:** commit `f283ff3` (branch `claude/pensive-hypatia-k6qnf3`، tag محلي `mvp-ui-stable-2026-06-17`).

- **الطريقة المفضّلة — revert غير مدمّر** (يُنشئ commit جديدًا يلغي تغييرات لاحقة، ويحافظ على التاريخ):
  ```bash
  # لإلغاء آخر commit مثلًا
  git revert <bad-commit-hash>

  # أو لإلغاء مدى من الـ commits بعد نقطة التثبيت (دون لمس f283ff3 نفسه)
  git revert --no-commit f283ff3..HEAD
  git commit -m "revert: back to MVP checkpoint f283ff3"
  ```

- **معاينة الفرق قبل أي رجوع:**
  ```bash
  git diff f283ff3..HEAD
  ```

- **استرجاع ملف واحد فقط من نقطة التثبيت** (بدون تغيير بقية الشجرة):
  ```bash
  git checkout f283ff3 -- <path/to/file>
  ```

- **`git reset` للضرورة القصوى فقط** (يعيد كتابة التاريخ — لا يُستخدم على فرع مشترك مدفوع إلا بوعي تام):
  ```bash
  # احتفظ بالتغييرات في working tree
  git reset --soft f283ff3
  # تجاهل كل ما بعد نقطة التثبيت (مدمّر)
  # git reset --hard f283ff3
  ```
  القاعدة: فضّل `revert` دائمًا. لا تلجأ لـ `reset --hard` إلا عند الضرورة ومع نسخة احتياطية للفرع.

---

_تم إنشاء هذا الملف كـ checkpoint توثيقي فقط — بدون أي تعديل على الواجهة أو المنطق أو البيانات._
