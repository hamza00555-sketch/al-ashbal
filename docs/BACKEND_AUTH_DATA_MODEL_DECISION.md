# Backend/Auth/Data Model Architecture Decision

> وثيقة تحليل وقرار معماري فقط (decision record). لا تضيف backend ولا auth ولا
> database ولا packages، ولا تنفّذ migration. الغرض: تثبيت قرار مبدئي للانتقال
> لاحقًا من demo/localStorage إلى production backend.
>
> يُكمّل: `docs/LEARNING_MATERIALS_PHASE_D_CHECKPOINT.md`،
> `docs/MATERIALS_UI_POLISH_CHECKPOINT.md`،
> `docs/SETTINGS_AND_MATERIALS_ARCHITECTURE.md`.

التاريخ: 2026-06-18 · الحالة: **مسودة قرار للمراجعة**

---

## Current State

- **Next.js (App Router) + TypeScript** — تطبيق demo يعمل بالكامل في المتصفّح.
- **التخزين:** متاجر `localStorage` (وIndexedDB للـ recording Blob) — لا قاعدة بيانات.
- **لا backend، لا auth، لا مزامنة بين الأجهزة.** المستخدم الحالي يُحلّ عبر `getMockUser(role)` من بيانات seed.
- **تدفّق التسجيل/الإرسال يعمل demo:** تسجيل → موافقة ولي الأمر → مراجعة المعلم.
- **نظام Learning Materials يعمل end-to-end:** مادة → درس → تكليف → إرسال → موافقة → قبول → نقاط بـ `materialId` → تقدّم المادة + رحلة الشبل.

**المتاجر الحالية (demo):** `materials`، `materialLessons`، `studentAssignments`، `submissions`، `points`، `workflow` (مراجعات)، `attendance`، `notifications`، `activities`، `lessonPrep`، `recordings` (IndexedDB). الأمنيات (`Wish`) في الـ mock db (`src/types`/`src/lib/data`).

**Stable anchors:**
- `5782661` — منطق Learning Materials (Phase D).
- `6c6d956` — تلميع UI المواد.
- `fc42eae` — checkpoint docs (Materials UI Polish).

---

## Core Roles

1. **Child** — يرى مهامه/تقدّمه/أمنياته فقط. يسجّل ويُرسل. لا يدير أحدًا.
2. **Parent** — يرى أطفاله المرتبطين به فقط، ويوافق على إرسالاتهم قبل وصولها للمعلم. يدير أمنياتهم/خصوصيتهم.
3. **Teacher** — يرى حلقاته وأطفال حلقته فقط. يدير المواد/الدروس/التكليفات/الحضور، ويراجع الإرسالات ويمنح النقاط.
4. **Guest / ضيف الشرف** (لاحقًا) — عرض محدود/read-only؛ **لا** يرى فيديوهات/أمنيات/ملاحظات خاصة بالطفل (قاعدة خصوصية صارمة).
5. **Admin** (لاحقًا عند الحاجة) — إدارة شاملة للحلقات/المستخدمين.

> قاعدة حاكمة (من CLAUDE.md): الخصوصية أهم من الواجهة — أي وصول لبيانات طفل/فيديو/أمنية يجب أن يكون parent-controlled ومحدود الصلاحية، والفيديو لا يصل المعلم قبل موافقة ولي الأمر.

---

## Core Data Entities

نموذج بيانات production مبدئي (أسماء حقول مبنية على المتاجر الحالية):

### Users / Profiles
`id` · `displayName` · `avatarUrl?` · `role (child|parent|teacher|guest|admin)` · `createdAt` · `updatedAt`
> auth identity منفصلة عن profile؛ بعض الأطفال قد لا يملكون auth account (parent-managed) — انظر Open Questions.

### Children (profile subtype)
`id` · `userId?` (إن وُجد حساب) · `displayName` · `gender?` · `age?` · `avatarUrl?` · `isActive` · `createdAt` · `updatedAt`

### ParentChildLinks
`id` · `parentId` · `childId` · `relationship` · `canApproveVideos` · `linkStatus (pending|active)?` · `createdAt`

### Halaqas
`id` · `name` · `teacherId` · `schedule?` · `status (active|archived)` · `createdAt`

### HalaqaMembers
`id` · `halaqaId` · `childId` · `status (active|left)` · `joinedAt`

### LearningMaterials
`id` · `halaqaId` · `name` · `type` · `iconKey` · `colorToken` · `showInChildProgress` · `targetPoints` · `order` · `archived` · `createdAt` · `updatedAt`

### MaterialLessons
`id` · `materialId` · `title` · `description?` · `surahOrTopic?` · `verseStart?` · `verseEnd?` · `defaultPoints` · `allowedSubmissionTypes[]` · `order` · `archived` · `createdAt` · `updatedAt`

### StudentAssignments
`id` · `halaqaId` · `materialId?` · `lessonId?` · `title` · `description?` · `points?` · `submissionType` · `assignedTo (halaqa|childId[])` · `dueDate?` · `status (active|closed|archived)` · `createdAt`
> حاليًا التكليف على مستوى الحلقة؛ `assignedTo` يسمح لاحقًا بتكليف طفل بعينه.

### Submissions
`id` · `assignmentId?` · `childId` · `materialId?` · `lessonId?` · `points?` · `mediaUrl?` · `mediaType (audio|video)` · `state` (≈ pending_parent|pending_teacher|accepted|rerecord) · `materialName?`/`lessonTitle?` (snapshot) · `createdAt`

### ParentApprovals (يُفضّل تضمينها كحالة على Submission، لا جدول منفصل)
إن فُصلت: `id` · `submissionId` · `parentId` · `status (approved|rerecord)` · `reviewedAt`
> **توصية:** أبقِها كحقول حالة على `Submission` (كما الآن) لتقليل التعقيد؛ تُفصل فقط إن احتجنا سجلّ تدقيق.

### TeacherReviews (نفس المنطق)
إن فُصلت: `id` · `submissionId` · `teacherId` · `status (accepted|rerecord)` · `pointsAwarded` · `notes?` · `reviewedAt`
> **توصية:** حالة على `Submission` + إنشاء `PointEntry` عند القبول.

### PointEntries
`id` · `childId` · `value` · `category` · `sourceType (manual|recitation|activity)` · `sourceId` · `materialId?` · `teacherId?` · `halaqaId?` · `reason?` · `note?` · `createdAt`
> **dedupe key:** فريد على `(childId, sourceType, sourceId)` — قبول نفس الإرسال مرتين يحدّث النقطة ولا يضاعفها (نفس سلوك `recordSourcedPoints` الحالي).

### Attendance
`id` · `halaqaId` · `lessonId?` · `childId` · `status (present|late|absent|not_joined)` · `joinedAt?` · `source (gate|manual)` · `createdAt`
> بوابة الحضور (gate: idle|open|closed) تبقى حالة على مستوى الدرس/الحلقة.

### Wishes / Rewards
`id` · `childId` · `title` · `description?` · `visibility` · `status` · `parentAction?` · `parentApprovalStatus?` · `createdAt` · `updatedAt`
> الأمنيات parent-controlled؛ لا تُعرض لضيف الشرف، ولا تُعدّ وعدًا ماديًا مضمونًا.

### Notifications
`id` · `recipientId` · `type` · `title` · `body` · `relatedEntity (type+id)?` · `href?` · `readAt?` · `createdAt`

### Media / Storage
- ملفات إرسالات الأطفال (audio/video) — حاليًا Blob في IndexedDB → لاحقًا object storage خاص (private bucket).
- صور avatar/profile.
- **خصوصية:** وسائط الطفل private بشكل افتراضي، وصول موقّع/محدود؛ لا روابط عامة. تُحذف/تُؤرشف وفق سياسة احتفاظ تُقرّر لاحقًا.

---

## Data Flow Mapping (production)

```
Teacher creates Material      (LearningMaterials)
  → Teacher creates Lesson    (MaterialLessons; defaultPoints, allowedSubmissionTypes)
    → Teacher creates Assignment (StudentAssignments; materialId, lessonId, points)
      → Child submits recording (Submissions; ينسخ materialId/lessonId/points + media)
        → Parent approves       (Submission.state: pending_parent → pending_teacher)
          → Teacher accepts      (Submission.state → accepted)
            → PointEntry created  (childId, value, materialId, sourceType=recitation, sourceId=submission.id)
              → Child progress     (يُحسب: earnedPoints/targetPoints لكل مادة، ورحلة الشبل = متوسط الظاهرة)
```

أين تُستخدم الحقول:
- **`materialId`** — يُنسخ Assignment→Submission→PointEntry؛ به تُنسب النقاط لدائرة المادة الصحيحة. غيابه → fallback (category→نوع المادة).
- **`lessonId`** — يربط بالدرس المحفوظ (عرض/مستقبل؛ لا يؤثر على الحساب الآن).
- **`points`** — مقترح الدرس (`defaultPoints`)؛ المعلم قد يعدّله عند القبول.
- **`sourceType`/`sourceId`** — مصدر النقطة + مفتاح منع التكرار.
- **dedupe** — يضمن أن إعادة القبول لا تضاعف النقاط.

---

## Permissions / Access Rules (مبدئية)

- الطفل يرى **مهامه وتقدّمه وأمنياته فقط**.
- ولي الأمر يرى **أطفاله المرتبطين به فقط**.
- المعلم يرى **حلقاته وأطفال حلقته فقط**.
- المعلم يدير **المواد/الدروس/التكليفات/الحضور داخل حلقته فقط**.
- ولي الأمر يوافق **فقط على إرسالات أطفاله**.
- المعلم يراجع **فقط إرسالات حلقته**، وبعد موافقة ولي الأمر.
- الفيديو **لا يصل المعلم قبل موافقة ولي الأمر**.
- الضيف/ضيف الشرف: dashboards محدودة أو read-only، **بدون** فيديوهات/أمنيات/ملاحظات خاصة.

> عند اختيار **Supabase**، تُترجَم هذه القواعد لاحقًا إلى **RLS policies** (سياسات صفّية حسب `auth.uid()` والروابط parent↔child / teacher↔halaqa). **لا policies تنفيذية الآن** — توثيق فقط.

---

## Backend Options

### 1) Supabase (Postgres + Auth + Storage + RLS + Realtime)
- **المزايا:** نموذج علائقي يطابق كياناتنا (روابط parent-child/halaqa)، RLS تخدم قواعد الخصوصية بدقّة، Storage للوسائط الخاصة، Auth جاهز، Realtime مفيد للإشعارات/البوابة، أدوات TypeScript/types.
- **المخاطر:** منحنى تعلّم RLS، إدارة migrations، vendor lock-in جزئي.
- **التعقيد:** متوسط.
- **مناسب متى:** عند الحاجة لعلاقات صارمة + صلاحيات دقيقة + وسائط خاصة — وهو حالنا.

### 2) Firebase (Firestore + Auth + Storage)
- **المزايا:** إعداد سريع، Auth/Storage/Push (FCM) ناضجة، realtime ممتاز، كان مذكورًا كخيار في CLAUDE.md.
- **المخاطر:** نموذج NoSQL يجعل علاقات parent-child/halaqa والاستعلامات المركّبة أصعب، قواعد الأمان أقل تعبيرًا من SQL/RLS للعلاقات المتشعّبة، تكلفة القراءات قد تكبر.
- **التعقيد:** منخفض-متوسط للبداية، يرتفع مع تعقيد العلاقات.
- **مناسب متى:** أولوية السرعة والإشعارات على صرامة العلاقات.

### 3) Custom backend (Node/Nest + Postgres + S3)
- **المزايا:** تحكّم كامل، منطق صلاحيات صريح.
- **المخاطر:** أكبر مجهود (auth/uploads/realtime/infra/تشغيل)، أبطأ للوصول لـ MVP.
- **التعقيد:** مرتفع.
- **مناسب متى:** متطلبات خاصة جدًا لا يغطّيها BaaS — ليس حالنا الآن.

### 4) تأجيل backend (الاستمرار demo)
- **المزايا:** صفر مخاطر الآن، نُكمل polish/QA.
- **المخاطر:** لا مزامنة/لا حسابات حقيقية؛ يؤجّل القيمة الأساسية.
- **مناسب متى:** قبل تثبيت data model — لكن لا ينبغي التأجيل طويلًا بعد هذا القرار.

---

## Recommended Direction

**Supabase** كاتجاه مُرشّح، **بعد** تثبيت data model schema.

السبب (مبني على احتياج التطبيق):
- **الأدوار + وصول parent-child + teacher-halaqa** علائقية بطبيعتها → Postgres + **RLS** يعبّر عنها بدقّة وأمان (قلب قاعدة الخصوصية لدينا).
- **Media uploads خاصة** → Supabase Storage ببكتات خاصة ووصول موقّع.
- **Teacher dashboard** يحتاج استعلامات مركّبة (حلقة/أطفال/تكليفات/نقاط) → SQL أنسب من NoSQL.
- **إشعارات مستقبلية** → Realtime + إمكان دمج push لاحقًا.
- **data model الحالي (demo) علائقي بالفعل** (ids + روابط) → ترحيل شبه مباشر للجداول.

ملاحظة: Firebase خيار معقول لو صارت الأولوية القصوى هي push/سرعة الإطلاق؛ لكن صرامة العلاقات والخصوصية ترجّح Supabase. **لا حسم نهائي مطلوب الآن** — هذا القرار يُعرض للموافقة.

---

## Migration Strategy (مراحل تدريجية)

- **Phase 1 — Schema & Types:** تثبيت schema docs (هذه الوثيقة)، وتوحيد TypeScript types مشتركة بين demo والـ backend (مصدر نوع واحد).
- **Phase 2 — Auth/Profiles فقط:** تسجيل دخول + جدول profiles/roles، مع إبقاء بقية المنطق demo.
- **Phase 3 — Materials/Lessons:** ترحيل `materials` + `materialLessons` للـ backend خلف نفس الواجهات (hooks).
- **Phase 4 — Assignments/Submissions/Points:** ترحيل التكليفات والإرسالات والنقاط (مع dedupe key) وتدفّق الموافقة/المراجعة.
- **Phase 5 — Media Storage:** نقل الوسائط من IndexedDB إلى object storage خاص.
- **Phase 6 — Notifications:** إشعارات حقيقية (realtime/push) باحترام الخصوصية.
- **Phase 7 — إزالة fallback الـ localStorage تدريجيًا** بعد ثبات كل مرحلة.

> مبدأ: كل مرحلة خلف نفس الـ hooks الحالية (`useMaterialsForHalaqa` …) لتبديل المصدر دون لمس الـ UI.

---

## What Not To Do Yet

- **لا نضيف backend قبل قرار schema.**
- **لا نضيف settings موسّعة قبل auth/profiles.**
- **لا نربط media production قبل قرار storage.**
- **لا ننقل كل شيء دفعة واحدة.**
- **لا نحذف localStorage demo الآن.**
- لا packages/إعدادات بنية تحتية في هذه المرحلة.

---

## Open Questions

1. هل لكل طفل حساب دخول مستقل أم **parent-managed** فقط؟
2. هل **المعلم** ينشئ الأطفال أم **ولي الأمر** يسجّلهم (onboarding)؟
3. هل ستكون هناك **أكثر من حلقة**؟
4. هل يمكن أن يكون الطفل في **أكثر من حلقة**؟
5. هل التسجيلات تُحفظ **دائمًا** أم مؤقتًا (سياسة احتفاظ/حذف)؟
6. هل ولي الأمر يراجع **كل فيديو** قبل المعلم **دائمًا** (هل من استثناءات)؟
7. هل الضيف/ضيف الشرف يحتاج **access حقيقي** أم **view demo** فقط؟
8. هل نحتاج **Arabic SMS/WhatsApp** لاحقًا أم **push** فقط؟

---

_وثيقة قرار/تحليل فقط — بلا أي كود أو UI أو CSS أو packages._
