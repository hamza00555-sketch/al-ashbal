# Manual QA — Before Demo Cleanup Checkpoint

> نقطة تثبيت (rollback anchor) قبل تنظيف الديمو القديم وفصل «دروس اليوم» عن المهام.
> توثيق فقط — لا تغيير كود.

- **Branch:** `claude/pensive-hypatia-k6qnf3`
- **HEAD:** `e851217` — `fix: sync child profile and live lesson cards`
- **Local tag:** `manual-qa-before-demo-cleanup` → `e851217`
- **Date:** 2026-06-18

## Summary (الحالة قبل التنظيف)

- ✅ **Learning Materials** يعمل end-to-end (مادة → درس → تكليف → إرسال → موافقة → قبول → نقاط → تقدّم).
- ✅ **Settings role-specific** يعمل (لكل دور ملف مستقل عبر `alashbal:demo-session` overrides).
- ✅ **Child profile sync** يعمل (override keyed by childId عبر `alashbal:child-overrides`؛ ينعكس في `/child` و`/parent`).
- ✅ **Parent pending fixed** (يعتمد متجر submissions الحيّ؛ لا يعود pending بعد الموافقة).
- ✅ build/lint ناجحان.

## لماذا هذا anchor

هذه آخر حالة مستقرة **قبل**:
- تنظيف بيانات الديمو القديمة المسيطرة (درس سورة الملك hardcoded، seeds قديمة).
- فصل «درس اليوم» (من تحضير المعلم) عن «المهام» (`/child/tasks`).
- إعادة تشكيل `/child/lessons` ككروت دروس compact + زر حضور كبير.

## Rollback

```bash
# الرجوع لهذه النقطة دون تدمير التاريخ:
git revert --no-commit e851217..HEAD && git commit -m "revert: back to pre-cleanup checkpoint e851217"
# أو معاينة الفرق:
git diff e851217..HEAD
```
لا تستخدم `git reset --hard` إلا للضرورة القصوى.
