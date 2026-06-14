# الأشبال — Phase 01 Claude Pack

هذه الحزمة هي **المرحلة الأولى** لبناء تطبيق **الأشبال** باستخدام Claude Opus / Claude Code.

الهدف من المرحلة الأولى ليس بناء كل التطبيق، بل بناء أساس نظيف وقابل للتوسع:

1. تثبيت هوية المشروع والبراند.
2. تثبيت المعمارية المقترحة.
3. تثبيت الأدوار والصلاحيات.
4. تجهيز هيكل المشروع والـ App Shell.
5. بناء Design System أولي مطابق للهوية.
6. بناء واجهات Mock أولية للطفل، ولي الأمر، المعلم، وضيف الشرف.
7. منع Claude من تنفيذ مزايا متقدمة قبل تثبيت الأساس.

## كيف تستخدم الحزمة؟

افتح مشروع جديد، ثم ضع هذه الملفات في جذر المشروع.

ابدأ مع Claude بهذا الترتيب:

1. اقرأ `CLAUDE.md`.
2. اقرأ ملفات `docs/`.
3. اقرأ `specs/phase-01-foundation/`.
4. لا تكتب كود إلا بعد أن يعرض خطة واضحة.

استخدم البرومبت الجاهز:

```txt
prompts/01_initial_review.md
```

ثم:

```txt
prompts/02_plan_phase_01.md
```

ثم نفّذ Task واحد في كل مرة باستخدام:

```txt
prompts/03_execute_single_task.md
```

## محتوى الحزمة

```txt
CLAUDE.md
README.md
docs/
  00_PRODUCT_SPEC.md
  01_BRAND_GUIDE.md
  02_ARCHITECTURE.md
  03_DATA_MODEL.md
  04_SECURITY_MODEL.md
  05_MVP_SCOPE.md
  06_IMPLEMENTATION_PLAN.md
specs/
  phase-01-foundation/
    requirements.md
    tasks.md
    acceptance-criteria.md
  design-system/
    requirements.md
    tasks.md
  app-shell/
    requirements.md
    tasks.md
  auth-roles/
    requirements.md
    tasks.md
prompts/
  01_initial_review.md
  02_plan_phase_01.md
  03_execute_single_task.md
  04_review_after_task.md
assets/
  visual-reference/
```

## ملاحظة مهمة

لا تطلب من Claude: "ابنِ تطبيق الأشبال كامل".

اطلب منه: "نفّذ المرحلة الأولى فقط حسب المواصفات".
