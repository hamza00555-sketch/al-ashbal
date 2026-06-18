# Learning Materials Phase D Checkpoint

> ملف توثيق وتثبيت فقط. لا يغيّر UI ولا CSS ولا منطقًا ولا بيانات.
> الغرض: تثبيت الحالة المستقرة بعد اكتمال أول نسخة متكاملة (end-to-end) من
> نظام Learning Materials.

تاريخ التثبيت: **2026-06-18**

---

## Stable Commit

- **Branch:** `claude/pensive-hypatia-k6qnf3`
- **Commit:** `5782661` — `feat(progress): apply accepted task points to materials` (Phase D)
- **Local tag:** `learning-materials-phase-d-stable` → `5782661`
  - الـ tag محلي فقط ولم يُدفع (دفع الـ tags محظور في البيئة). الاعتماد الأساسي للرجوع هو **commit hash**.
- **Short description:** أول نسخة متكاملة للنظام التعليمي: المعلم يدير المواد ودروسها، ينشئ تكليفًا من مادة/درس، والطفل يسجّل ويُرسل، يوافق ولي الأمر، يقبل المعلم، فتُسجَّل النقاط بـ `materialId` ويتحدّث تقدّم المادة الصحيحة ورحلة الشبل.

---

## What Is Now Working

يعمل النظام التالي end-to-end (كنماذج demo):

1. المعلم يدير المواد (إضافة/تعديل/إظهار-إخفاء/ترتيب/أرشفة) في `/teacher/materials`.
2. المعلم يدير الدروس داخل كل مادة (إضافة/تعديل/أرشفة/استعادة/ترتيب).
3. المعلم ينشئ تكليفًا من مادة + درس مع تعبئة تلقائية (العنوان/الوصف/النقاط/طريقة التسليم) في `/teacher/prep`.
4. الطفل يرى المهمة مع سطر meta هادئ «المادة · الدرس» في `/child/tasks`.
5. الطفل يسجّل (صوت/فيديو) ويُرسل.
6. ولي الأمر يوافق في `/parent/approvals`.
7. المعلم يراجع ويقبل في `/teacher/reviews` (الأحدث/المعلّق أولًا).
8. تُسجَّل النقاط مع `materialId` عند القبول.
9. تقدّم المادة الصحيحة يتحدّث في `/child/progress`.
10. رحلة الشبل (overall) تتحدّث كمتوسط المواد الظاهرة.
11. التكليفات القديمة بلا مادة لا تزال تعمل عبر fallback (category → نوع المادة).

---

## Data Flow

```
LearningMaterial            (مادة: اسم/نوع/أيقونة/لون/هدف نقاط/ظهور/ترتيب)
  → MaterialLesson          (درس داخل المادة: عنوان/سورة/آيات/نقاط افتراضية/أنواع تسليم)
    → StudentAssignment     (تكليف: ينسخ materialId/lessonId/points + لقطة الأسماء)
      → Submission          (إرسال الطفل: ينسخ نفس الحقول من التكليف)
        → PointEntry        (عند قبول المعلم: نقطة تحمل materialId)
          → ChildProgress   (تقدّم كل مادة + رحلة الشبل، مشتق من النقاط)
```

الحقول المهمة المنقولة عبر السلسلة:
- **`materialId`** — يربط التكليف/الإرسال/النقطة بالمادة؛ به تُنسب النقاط للدائرة الصحيحة.
- **`lessonId`** — يربط بالدرس المحفوظ (لا يؤثر على الحساب الآن، للعرض/المستقبل).
- **`points`** — النقاط المقترحة من الدرس (`defaultPoints`)، قابلة لتعديل المعلم.
- **`materialName` / `lessonTitle`** — لقطات نصّية للعرض الهادئ في كرت الطفل حتى لو تغيّرت المادة/الدرس لاحقًا.

> الإسناد: النقطة تُنسب للمادة عبر `materialId` إن وُجد، وإلا عبر خريطة `category → نوع المادة` (fallback) في helper التقدّم.

---

## Current Storage

النظام لا يزال **demo / localStorage** بالكامل (الـ Blob للتسجيل في IndexedDB):

- `alashbal:materials` — متجر المواد.
- `alashbal:material-lessons` — متجر دروس المواد.
- `alashbal:student-assignments` — متجر تكليفات الطلاب.
- `alashbal:submissions` — متجر الإرسالات (دورة حياة التسميع).
- `alashbal:points` — متجر النقاط.

**لا يوجد backend ولا auth بعد.** كل شيء محلي على المتصفّح.

---

## QA Results

ملخّص آخر فحص شامل (QA-Learning-Materials-Full-Flow-After-Phase-D-01):

- ✅ linked flow passed (Quran 0% → 25%، Overall 0 → 8، Points 0 → 5، النقطة تحمل `materialId`).
- ✅ legacy fallback passed (Quran 0% → 15% عبر recitation→القرآن، Points 0 → 3، `materialId = null`).
- ✅ material states: إخفاء/تغيير `targetPoints`/ترتيب/أرشفة تنعكس على `/child/progress`، ونقاط الطفل لم تُفقد (ظلّت 5).
- ✅ no console errors على أي صفحة.
- ✅ build / lint passed.
- ✅ progress updates correctly (لا تناقض بين الدوائر ورحلة الشبل).

---

## Known Limitations

- لا backend.
- لا auth.
- المواد والدروس (وكل المتاجر) محلية في localStorage.
- لا توجد مزامنة بين الأجهزة.
- لا يزال يحتاج لاحقًا تصميم production data model.
- إعدادات المستخدمين غير منفّذة بعد.
- رفع صور/بروفايلات (upload profiles/images) غير منفّذ.
- overlays النهائية مؤجلة بسبب رصيد التوليد.
- التسجيل الحقيقي اختُبر على جهاز واحد ويحتاج أجهزة إضافية لاحقًا.

---

## Next Recommended Phases

1. UX polish لـ `/teacher/materials` عند الحاجة.
2. تنفيذ معمارية الإعدادات حسب الدور لاحقًا (راجع `docs/SETTINGS_AND_MATERIALS_ARCHITECTURE.md`).
3. قرار Backend / Auth.
4. تصميم production database model مبني على متاجر الـ demo الحالية.
5. ترحيل تدريجي من localStorage إلى backend.
6. الإشعارات (push حقيقية).
7. جاهزية الإنتاج (أمان/أداء/اختبارات/نشر).

---

## Rollback Notes

- **anchor النظام التعليمي الحالي:** commit `5782661` (tag محلي `learning-materials-phase-d-stable`).
- إن حصل خلل لاحقًا، استخدم **`git revert`** للـ commits الجديدة بدلًا من `reset` (غير مدمّر، يحافظ على التاريخ):
  ```bash
  git revert <bad-commit-hash>
  # أو مدى بعد نقطة التثبيت دون لمسها:
  git revert --no-commit 5782661..HEAD && git commit -m "revert: back to phase D checkpoint 5782661"
  ```
- معاينة الفرق: `git diff 5782661..HEAD`
- استرجاع ملف واحد: `git checkout 5782661 -- <path>`
- **لا تستخدم `git reset --hard`** إلا للضرورة القصوى ومع نسخة احتياطية للفرع.

---

_ملف checkpoint توثيقي فقط — بلا أي تعديل على الواجهة أو المنطق أو البيانات._
