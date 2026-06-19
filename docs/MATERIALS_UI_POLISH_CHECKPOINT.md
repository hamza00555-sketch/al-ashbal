# Materials UI Polish Checkpoint

> ملف توثيق وتثبيت فقط. لا يغيّر UI ولا CSS ولا منطقًا ولا بيانات.
> الغرض: تثبيت حالة صفحة `/teacher/materials` بعد تلميع الكثافة البصرية
> وتجربة الجوال. هذا checkpoint أصغر يلي
> `docs/LEARNING_MATERIALS_PHASE_D_CHECKPOINT.md` (تثبيت منطق النظام التعليمي).

تاريخ التثبيت: **2026-06-18**

---

## Stable Commit

- **Branch:** `claude/pensive-hypatia-k6qnf3`
- **Commit:** `6c6d956` — `style(materials): reduce teacher materials density`
- **Local tag:** `materials-ui-polish-stable` → `6c6d956` (محلي فقط، لم يُدفع — دفع الـ tags محظور في البيئة؛ الاعتماد على commit hash).
- **Short description:** تلميع UI/UX لصفحة إدارة المواد والدروس (تقليل الزحمة + إصلاح الجوال) دون أي تغيير في المنطق.

---

## What Was Improved

- **فورم إضافة المادة صار collapsible:** زر «+ إضافة مادة» أعلى القائمة يفتح الفورم عند الطلب، ويُغلق تلقائيًا مع رسالة نجاح بعد الإضافة — لم يعد يأخذ مساحة دائمة.
- **كروت المواد أقل زحمة:** الكرت يُقرأ «كمادة» أولًا لا كلوحة أزرار.
- **أزرار الترتيب صارت compact:** سهمان ↑/↓ مدمجان بجانب العنوان بدل زرّين نصّيين.
- **تقسيم أزرار المادة:** صف **primary** (تعديل / إدارة الدروس) واضح، وصف **secondary** هادئ تحت فاصل (إظهار-إخفاء / أرشفة).
- **لوحة الدروس أوضح:** قسم داخلي بخلفية أغمق وإطار خفيف، وصفوف دروس compact مع أزرار أخف و↑/↓.
- **desktop عند فتح الدروس:** الكرت يمتد بعرض الصف (`lg:col-span-2`) فتختفي الفجوات العمودية في الشبكة.
- **الجوال:** أُضيف bottom spacing (`pb-28`) حتى لا يقطع شريط التنقل السفلي آخر الكروت.

---

## What Still Works

كل وظائف النظام التعليمي سليمة بعد التلميع:

- إضافة مادة ✅
- تعديل مادة ✅
- إظهار/إخفاء مادة من تقدّم الطفل ✅
- ترتيب المواد (↑/↓) ✅
- أرشفة/استعادة مادة ✅
- إدارة الدروس داخل المادة ✅
- إضافة/تعديل/ترتيب/أرشفة/استعادة درس ✅
- `/child/progress` لا يزال يتأثر بالمواد (إظهار/إخفاء/ترتيب/`targetPoints`) ✅
- `/teacher/prep` لا يزال ينشئ تكليفًا من مادة ودرس ✅
- `/child/tasks` لا يزال يعرض meta «المادة · الدرس» ✅

---

## QA Summary

ملخّص آخر فحص (QA-Teacher-Materials-Polish-Regression-01):

- وظائف المواد: **passed**.
- وظائف الدروس: **passed**.
- انعكاس التقدّم على `/child/progress`: **passed**.
- smoke المسار التعليمي (prep → child task meta): **passed**.
- الجوال: لا يقص المحتوى خلف bottom nav (آخر كرت bottom 572 فوق nav top 703 على viewport جوال واقعي).
- **no console errors**.
- **build / lint passed**.

---

## Known Limitations

- الصفحة ما زالت **route واحد** (`/teacher/materials`)، وليست صفحة تفاصيل منفصلة لكل مادة.
- إذا كثرت الدروس جدًا مستقبلًا، قد نحتاج **صفحة تفاصيل مادة** مستقلة.
- النظام لا يزال **localStorage demo** بالكامل.
- لا **backend / auth** بعد.
- **إعدادات المستخدمين** غير منفّذة بعد.

---

## Recommended Next Decision

الخطوة القادمة يجب أن تكون **قرارًا** لا تنفيذًا مباشرًا:

1. **Role-based Settings implementation** — تنفيذ صفحات الإعدادات حسب الدور.
2. **Backend/Auth architecture decision** — اختيار المزوّد وطريقة المصادقة.
3. **Production data model planning** — تصميم نموذج بيانات مبني على متاجر الـ demo الحالية.

توصية:
- **لا نبدأ Backend قبل تثبيت قرار data model.**
- **لا نبدأ Settings إلا بسكوب صغير حسب الدور** (راجع `docs/SETTINGS_AND_MATERIALS_ARCHITECTURE.md`).

---

## Rollback Notes

- **`6c6d956`** هو anchor تلميع صفحة المواد (UI polish).
- **`5782661`** هو anchor منطق نظام Learning Materials (Phase D).
- إذا حدث خلل لاحقًا، استخدم **`git revert`** للـ commits الجديدة بدلًا من `reset` (غير مدمّر، يحافظ على التاريخ):
  ```bash
  git revert <bad-commit-hash>
  # للرجوع لتلميع المواد دون لمسه:
  git revert --no-commit 6c6d956..HEAD && git commit -m "revert: back to materials UI polish 6c6d956"
  ```
- معاينة الفرق: `git diff 6c6d956..HEAD`
- **تجنّب `git reset --hard`** إلا للضرورة القصوى ومع نسخة احتياطية للفرع.

---

_ملف checkpoint توثيقي فقط — بلا أي تعديل على الواجهة أو المنطق أو البيانات._
