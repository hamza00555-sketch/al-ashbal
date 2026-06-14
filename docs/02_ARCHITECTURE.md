# Architecture — الأشبال

## الهدف المعماري

بناء تطبيق صغير من حيث عدد المستخدمين، لكنه نظيف من حيث الصلاحيات والخصوصية وقابل للتوسع لاحقًا.

## Stack مقترح

### Frontend

- Next.js
- TypeScript
- React
- CSS Modules أو Tailwind حسب قرار التنفيذ
- RTL Arabic first
- PWA-ready

### Backend / Services لاحقًا

- Firebase Auth
- Firestore
- Firebase Storage للفيديو
- Firebase Cloud Functions
- Firebase Cloud Messaging

## المرحلة الأولى لا تحتاج Firebase كامل

Phase 01 يمكن بناؤها بـ mock data منظم داخل data layer، مع تجهيز interfaces/types بحيث يسهل استبدال mock data بـ Firestore لاحقًا.

## الطبقات المقترحة

```txt
src/
  app/
    (public)/
    (auth)/
    child/
    parent/
    teacher/
    guest/
    admin/
  components/
    ui/
    layout/
    brand/
    cards/
    progress/
    badges/
  features/
    auth/
    lessons/
    attendance/
    recitations/
    approvals/
    progress/
    wishes/
    notifications/
  lib/
    auth/
    data/
    permissions/
    validation/
    dates/
  types/
  content/
  styles/
```

## قواعد مهمة

- كل Role له route group واضح.
- لا تخلط منطق الطفل وولي الأمر والمعلم في component واحد.
- business logic في `features/` أو `lib/` وليس داخل JSX.
- استخدم TypeScript types من البداية.
- mock data يجب أن يشبه data model الحقيقي.
- لا تكتب Firebase مباشرة داخل components.

## Phase 01 Output

المطلوب في المرحلة الأولى:

- مشروع Next.js شغال.
- RTL مضبوط.
- theme بنفسجي.
- Design tokens.
- مكونات UI أولية.
- صفحات Mock للأدوار.
- Navigation حسب الدور.
- Mock data واضح.
- لا يوجد تخزين فيديو حقيقي بعد.
- لا يوجد Auth حقيقي بعد، فقط role switcher أو mock session.
