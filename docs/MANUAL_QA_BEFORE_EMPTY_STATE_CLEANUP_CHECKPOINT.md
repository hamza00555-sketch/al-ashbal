# Manual QA — Before Empty-State Cleanup Checkpoint

> Rollback anchor قبل تحويل التطبيق من demo-filled إلى empty-first. توثيق فقط.

- **Branch:** `claude/pensive-hypatia-k6qnf3`
- **HEAD:** `15f4669` — `fix: clean demo data and separate today lessons`
- **Local tag:** `manual-qa-before-empty-state-cleanup` → `15f4669`
- **Date:** 2026-06-18

## Summary (الحالة قبل التنظيف)

- ✅ today lessons separated from tasks (درس اليوم من تحضير المعلم، لا من المهام).
- ✅ child profile sync working (override keyed by childId).
- ✅ settings role-specific working.
- ✅ learning materials flow working end-to-end.

هذه النقطة **قبل** empty-first cleanup (إيقاف auto-seed للبيانات التجريبية
التي تظهر للمستخدم: المواد/الدروس/المهام/الأمنيات/الإشعارات/الأوسمة/الأطفال
المرتبطين/المراجعات/إحصاءات الداشبورد).

## Rollback

```bash
git revert --no-commit 15f4669..HEAD && git commit -m "revert: back to pre-empty-state checkpoint 15f4669"
git diff 15f4669..HEAD
```
