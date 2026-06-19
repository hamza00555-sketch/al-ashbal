# Production Data Model Schema — Draft

> **مسودة schema للإنتاج فقط** (draft). لا migrations، لا كود تطبيق، لا packages.
> مصدر الحقيقة: `docs/BACKEND_AUTH_DATA_MODEL_DECISION.md` (القرار: **Supabase /
> Postgres + RLS + Storage**، بعد تثبيت هذا الـ schema). الأسماء/الحقول مشتقّة من
> متاجر الـ demo الحالية (`src/lib/demo/*`, `src/types`).
>
> الحالة: **schema v1 — قرارات معتمدة** (انظر «Approved Schema Decisions v1») · التاريخ: 2026-06-18 · anchors:
> `5782661` (Phase D logic) · `6c6d956` (UI polish) · `8f207d7` (decision doc).

اتفاقيات عامة:
- كل المفاتيح الأساسية `id uuid primary key default gen_random_uuid()` ما لم يُذكر غير ذلك.
- كل جدول فيه `created_at timestamptz not null default now()`، وأغلبها `updated_at timestamptz not null default now()` (يُحدّث عبر trigger).
- الحذف منطقي حيثما أمكن (`archived boolean` / `status`) بدل الحذف الفعلي — يطابق فلسفة الـ demo (أرشفة لا حذف).
- التسمية: جداول/أعمدة `snake_case`؛ الطبقة الأمامية تُبقي `camelCase` عبر mapping.
- `enum`s تُنفّذ كـ Postgres enum types (أو `text` + `check`)، مذكورة أدناه.

---

## Approved Schema Decisions v1

> قرارات v1 معتمدة (2026-06-18) لتحويل الأسئلة المفتوحة إلى أساس قابل للتنفيذ.
> تحكم هذه القرارات الـ schema أعلاه وأول تنفيذ (Auth/Profiles — انظر
> `docs/AUTH_PROFILES_PHASE2_SCOPE.md`).

1. **حساب الطفل:** الطفل **لا يحتاج auth user مستقل الآن**؛ يكون **child profile فقط** (`children.profile_id = null`). دخول الطفل لاحقًا عبر **parent-managed access** أو **device/session mode**. أول تنفيذ Auth **للمعلم وولي الأمر فقط**.
2. **من يسجّل الأطفال:** في MVP الأول **المعلم/المشرف ينشئ الأطفال** داخل الحلقة (أو seed/import). ولي الأمر **لاحقًا** يربط نفسه بطفله عبر **invite/code/approval**. لا onboarding كامل للأطفال الآن.
3. **الحلقات:** الـ schema يدعم **أكثر من حلقة**، لكن التنفيذ الأول يبدأ بـ **حلقة واحدة (teacher-owned)**. لا إدارة حلقات معقّدة الآن.
4. **الطفل في أكثر من حلقة:** مسموح في الـ schema عبر `halaqa_members`، لكن الـ UI الحالي يعامل الطفل كأن له **حلقة أساسية واحدة**. دعم التعدد الكامل **مؤجّل**.
5. **موافقة ولي الأمر:** كل media submission من الطفل (خصوصًا audio/video) **يمر على ولي الأمر قبل المعلم**؛ لا يصل التسجيل للمعلم قبل الموافقة. سياسة المهام **غير الإعلامية** قد تختلف لاحقًا، **ليس الآن**.
6. **حفظ التسجيلات:** **لا تُحفظ دائمًا** كقرار افتراضي؛ الـ **metadata تبقى**، أما **media retention فمؤقت وconfigurable لاحقًا**. لا مدة نهائية الآن.
7. **الضيف:** **read-only / demo-only لاحقًا**؛ **لا وصول حقيقي** لبيانات الأطفال في Phase 2.
8. **الإشعارات:** تأجيل **SMS/WhatsApp**؛ **Push لاحقًا**؛ **Phase 2 لا تشمل notifications**.
9. **تعديل النقاط:** بعد قبول المعلم **لا تُعدّل النقاط في Phase 2**. أي تعديل لاحق يكون عبر **audit log / adjustment entry** (لا تعديل مباشر، يحافظ على dedupe والتاريخ).
10. **الحذف:** **لا hard delete** للكيانات الأساسية — استخدم `status` / `archived` / soft delete (مواد/دروس/تكليفات…).
11. **اتجاه الـ backend:** **Supabase** هو الاتجاه المرشّح لاحقًا. **لا** Supabase implementation الآن؛ قبل التنفيذ نثبّت **scope Auth/Profiles فقط**.

---

## 1. Entity Relationship Overview

```
auth.users (Supabase)
   1───1  profiles
              │ (role)
   ┌──────────┼───────────────────────────┐
 parent     teacher                       child
   │           │                            │
   │           │ owns                       │ has profile-row
   │        halaqas ──1:N── halaqa_members ─┤
   │           │                            │
 parent_child_links ──────────────────────-┘
               │
   halaqas ─1:N─ learning_materials ─1:N─ material_lessons
               │            │                   │
               └─1:N─ student_assignments ──────┘ (material_id, lesson_id)
                              │
                          submissions ─1:1(opt)─ recording media (Storage)
                              │
                       point_entries (source_type, source_id, material_id)
                              │
                     (child progress = derived, not stored)

attendance · wishes · notifications · activities  (per child / halaqa)
```

العلاقات الأساسية:
- `profiles 1:1 auth.users` (id مشترك).
- `parent_child_links N:M` بين parent و child.
- `halaqas 1:N halaqa_members N:1 children` (طفل قد يكون في أكثر من حلقة — انظر Open Questions).
- `learning_materials 1:N material_lessons`.
- `student_assignments` تشير إلى `halaqa` + (اختياري) `material` + `lesson`.
- `submissions N:1 child`, اختياريًا `N:1 assignment/material/lesson`.
- `point_entries N:1 child`, اختياريًا `N:1 material`, فريدة على مصدرها (dedupe).

---

## 2. Enum Types

```sql
create type user_role          as enum ('child','parent','teacher','guest','admin');
create type material_type       as enum ('quran','tajweed','behavior','hadith','adhkar','adab','custom');
create type color_token         as enum ('purple','gold','success');
create type submission_kind      as enum ('audio','video','parent_check','teacher_check'); -- lesson allowed types
create type assignment_submission as enum ('none','audio','video','audio_or_video');
create type assignment_status    as enum ('active','closed','archived');
create type submission_state     as enum ('pending_parent','pending_teacher','accepted','rerecord');
create type point_category       as enum ('participation','recitation','behavior','improvement','attendance','needs_follow_up','activity');
create type point_source_type    as enum ('manual','recitation','activity');
create type attendance_status    as enum ('present','late','absent','not_joined','excused');
create type attendance_source    as enum ('gate','manual');
create type gate_status          as enum ('idle','open','closed');
create type wish_status          as enum ('new','seen','converted','rewarded','archived');
create type link_status          as enum ('pending','active','revoked');
```

---

## 3. Tables

### 3.1 profiles
يمثّل أي مستخدم له هوية. مرتبط بـ `auth.users`.

| column | type | notes |
|---|---|---|
| id | uuid PK | = `auth.users.id` (FK → auth.users.id, on delete cascade) |
| role | user_role not null | |
| display_name | text not null | |
| avatar_url | text | Storage path / public-safe url |
| phone | text | لولي الأمر/المعلم (اختياري) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> الطفل **قد لا يملك** صف auth (parent-managed) — في تلك الحالة بياناته في `children` فقط و`children.profile_id` = null. انظر Open Questions Q1.

### 3.2 children
ملف الطفل (subtype). منفصل عن profiles لأن بعض الأطفال بلا حساب.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id (nullable, unique) | موجود فقط لو للطفل حساب دخول |
| display_name | text not null | |
| gender | text check (gender in ('male','female')) | nullable |
| age | int | nullable |
| avatar_url | text | |
| is_active | boolean not null default true | |
| created_at / updated_at | timestamptz | |

### 3.3 parent_child_links
ربط N:M بين أولياء الأمور والأطفال.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| parent_id | uuid FK → profiles.id (role=parent) | |
| child_id | uuid FK → children.id on delete cascade | |
| relationship | text | "father" … |
| can_approve_videos | boolean not null default true | |
| status | link_status not null default 'active' | |
| created_at | timestamptz | |
| | | **unique (parent_id, child_id)** |

### 3.4 halaqas
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| teacher_id | uuid FK → profiles.id (role=teacher) | |
| name | text not null | |
| schedule | jsonb | أيام/أوقات (مرن) |
| status | text not null default 'active' check (status in ('active','archived')) | |
| created_at / updated_at | timestamptz | |

### 3.5 halaqa_members
عضوية الطفل في حلقة (يسمح بأكثر من حلقة).

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| halaqa_id | uuid FK → halaqas.id on delete cascade | |
| child_id | uuid FK → children.id on delete cascade | |
| status | text not null default 'active' check (status in ('active','left')) | |
| joined_at | timestamptz not null default now() | |
| | | **unique (halaqa_id, child_id)** |

### 3.6 learning_materials
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| halaqa_id | uuid FK → halaqas.id on delete cascade | |
| name | text not null | |
| type | material_type not null | |
| icon_key | text not null | مفتاح من مجموعة icon_* الموجودة |
| color_token | color_token not null | |
| show_in_child_progress | boolean not null default true | |
| target_points | int not null default 20 check (target_points >= 1) | |
| sort_order | int not null default 0 | (`order` كلمة محجوزة → `sort_order`) |
| archived | boolean not null default false | |
| created_at / updated_at | timestamptz | |

### 3.7 material_lessons
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| material_id | uuid FK → learning_materials.id on delete cascade | |
| title | text not null | |
| description | text | |
| surah_or_topic | text | |
| verse_start | int | nullable (السلوك/التجويد لا يحتاجها) |
| verse_end | int | nullable |
| default_points | int not null default 0 check (default_points >= 0) | |
| allowed_submission_types | submission_kind[] not null default '{}' | مصفوفة enum |
| sort_order | int not null default 0 | |
| archived | boolean not null default false | |
| created_at / updated_at | timestamptz | |

### 3.8 student_assignments
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| halaqa_id | uuid FK → halaqas.id on delete cascade | |
| teacher_id | uuid FK → profiles.id | منشئ التكليف |
| material_id | uuid FK → learning_materials.id (nullable, on delete set null) | |
| lesson_id | uuid FK → material_lessons.id (nullable, on delete set null) | |
| title | text not null | |
| description | text | |
| points | int | nullable (من الدرس أو يدوي) |
| submission_type | assignment_submission not null default 'audio_or_video' | |
| assigned_to_child_id | uuid FK → children.id (nullable) | null = كل الحلقة |
| material_name | text | snapshot للعرض |
| lesson_title | text | snapshot للعرض |
| due_label | text | نص حر حاليًا؛ مرشّح لـ `due_date timestamptz` لاحقًا |
| status | assignment_status not null default 'active' | |
| created_at / updated_at | timestamptz | |

### 3.9 submissions
موافقة ولي الأمر ومراجعة المعلم **كحالة** هنا (قرار التصميم: لا جداول منفصلة).

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| assignment_id | uuid FK → student_assignments.id (nullable, on delete set null) | |
| child_id | uuid FK → children.id on delete cascade | |
| material_id | uuid FK → learning_materials.id (nullable) | snapshot للإسناد |
| lesson_id | uuid FK → material_lessons.id (nullable) | |
| points | int | مقترح من التكليف |
| media_path | text | مسار في Storage (private bucket) |
| media_type | text check (media_type in ('audio','video')) | |
| state | submission_state not null default 'pending_parent' | |
| material_name / lesson_title | text | snapshot |
| parent_reviewed_at | timestamptz | متى وافق/رفض ولي الأمر |
| teacher_reviewed_at | timestamptz | متى قبل/طلب إعادة المعلم |
| teacher_note | text | |
| created_at / updated_at | timestamptz | |

> **اختياري (سجلّ تدقيق):** لو احتجنا تاريخًا كاملًا للقرارات، نضيف لاحقًا `submission_reviews(id, submission_id, reviewer_id, role, action, points_awarded, note, reviewed_at)`. ليس ضروريًا للـ MVP.

### 3.10 point_entries
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| child_id | uuid FK → children.id on delete cascade | |
| value | int not null | يسمح بالسالب (needs_follow_up) |
| category | point_category not null | |
| source_type | point_source_type not null | |
| source_id | text not null | submission.id / activity.id / 'manual:<uuid>' |
| material_id | uuid FK → learning_materials.id (nullable) | الإسناد المباشر؛ غيابه → fallback بالفئة |
| teacher_id | uuid FK → profiles.id (nullable) | |
| halaqa_id | uuid FK → halaqas.id (nullable) | |
| reason | text | |
| note | text | |
| created_at | timestamptz | |
| | | **unique (child_id, source_type, source_id)** ← dedupe key |

### 3.11 attendance
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| halaqa_id | uuid FK → halaqas.id on delete cascade | |
| lesson_ref | text | معرّف الجلسة/الدرس (حر حاليًا) |
| child_id | uuid FK → children.id on delete cascade | |
| status | attendance_status not null | |
| joined_at | timestamptz | |
| source | attendance_source not null default 'manual' | |
| created_at | timestamptz | |
| | | **unique (halaqa_id, lesson_ref, child_id)** |

> **بوابة الحضور** حالة لحظية على مستوى الجلسة → جدول مساعد `attendance_gates(id, halaqa_id, lesson_ref unique, status gate_status, opened_at, closed_at, grace_minutes int default 10, meet_url, teacher_id)`.

### 3.12 wishes
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| child_id | uuid FK → children.id on delete cascade | |
| title | text not null | |
| description | text | |
| visibility | text | (child/parent) — parent-controlled |
| status | wish_status not null default 'new' | |
| parent_action | text | keep/convert_to_goal/reward_badge/not_now |
| created_at / updated_at | timestamptz | |

### 3.13 notifications
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| recipient_id | uuid FK → profiles.id on delete cascade | |
| type | text not null | |
| title | text not null | |
| body | text | |
| related_entity_type | text | 'submission'|'wish'|… |
| related_entity_id | text | |
| href | text | |
| read_at | timestamptz | null = غير مقروء |
| created_at | timestamptz | |

### 3.14 activities (مستقبلي — موجود كـ demo)
نموذج مبدئي: `activities(id, halaqa_id, type, status, title, questions jsonb, created_at)` + `activity_answers(id, activity_id, child_id, answers jsonb, created_at, unique(activity_id, child_id))`. تُفصّل عند ترحيلها.

---

## 4. Role-Based Access Assumptions

- **child** — يقرأ/يكتب بياناته فقط: تكليفاته (عبر عضوية حلقته)، إرسالاته، تقدّمه (مشتق)، أمنياته، إشعاراته. لا يرى أطفالًا آخرين.
- **parent** — يقرأ بيانات أطفاله المرتبطين به فقط (عبر `parent_child_links`)، ويعدّل حالة `submissions` لأطفاله (موافقة/إعادة)، ويدير أمنياتهم. لا يرى أطفال غيره.
- **teacher** — يقرأ/يكتب داخل حلقاته فقط: المواد/الدروس/التكليفات/الحضور، ويراجع `submissions` لأطفال حلقته (بعد موافقة ولي الأمر)، ويُنشئ `point_entries`.
- **guest / ضيف الشرف** — read-only محدود (لوحات عامة)، **بدون** فيديوهات/أمنيات/ملاحظات/تسجيلات خاصة.
- **admin** (لاحقًا) — وصول إداري واسع، يُقيَّد بسياسة منفصلة.

دوال مساعدة مقترحة (security definer) لتبسيط السياسات:
- `is_parent_of(child uuid) returns boolean`
- `is_teacher_of_halaqa(halaqa uuid) returns boolean`
- `teaches_child(child uuid) returns boolean` (عبر halaqa_members)
- `current_role() returns user_role` (من profiles)

---

## 5. RLS Policy Draft (بالـ pseudo فقط — لا تنفيذ الآن)

> تُفعّل RLS على كل الجداول الحسّاسة. أمثلة توضيحية لا نهائية.

**children**
```
enable row level security;
-- child يقرأ صفّه
select: profile_id = auth.uid()
-- parent يقرأ أطفاله
select: is_parent_of(id)
-- teacher يقرأ أطفال حلقته
select: teaches_child(id)
-- التعديل: parent (لأطفاله) أو admin
update: is_parent_of(id) or current_role() = 'admin'
```

**parent_child_links**
```
select: parent_id = auth.uid() or teaches_child(child_id) or current_role()='admin'
insert/update: current_role() in ('admin') or parent_id = auth.uid()   -- حسب onboarding (Q2)
```

**halaqas / learning_materials / material_lessons / student_assignments**
```
select: is_teacher_of_halaqa(halaqa_id)
        or (current_role()='child'   and child_in_halaqa(auth_child(), halaqa_id))
        or (current_role()='parent'  and parent_child_in_halaqa(auth.uid(), halaqa_id))
insert/update/delete: is_teacher_of_halaqa(halaqa_id)   -- المعلم فقط داخل حلقته
```
(للمواد/الدروس/التكليفات: نفس الفكرة عبر join على `halaqa_id`/`material.halaqa_id`.)

**submissions**
```
select: child owns (child.profile_id = auth.uid())
        or is_parent_of(child_id)
        or teaches_child(child_id)
insert: child owns (الطفل يُرسل تسميعه)
update (parent gate): is_parent_of(child_id)
        and state = 'pending_parent'
        and new.state in ('pending_teacher','rerecord')
update (teacher review): teaches_child(child_id)
        and state = 'pending_teacher'
        and new.state in ('accepted','rerecord')
```
> يضمن **عدم وصول الفيديو للمعلم قبل موافقة ولي الأمر** (انتقال الحالة محكوم بالدور).

**point_entries**
```
select: child owns or is_parent_of(child_id) or teaches_child(child_id)
insert/update: teaches_child(child_id)   -- المعلم فقط يمنح النقاط
-- dedupe عبر unique(child_id, source_type, source_id) + upsert
```

**wishes**
```
select: child owns or is_parent_of(child_id)         -- (ليس للمعلم/الضيف)
insert: child owns
update: is_parent_of(child_id)                         -- parent_action
```

**notifications**
```
select/update(read_at): recipient_id = auth.uid()
```

**guest** — سياسات `select` ضيّقة على بيانات عامة فقط؛ لا صلاحية على submissions/wishes/recordings.

---

## 6. Storage Buckets

| bucket | visibility | محتوى | ملاحظات |
|---|---|---|---|
| `submissions` | **private** | تسجيلات الأطفال (audio/video) | وصول عبر signed URLs قصيرة العمر؛ مسار `submissions/{halaqa_id}/{child_id}/{submission_id}.{ext}`؛ سياسات storage تطابق RLS الخاصة بـ submissions (parent/teacher/child-owner فقط) |
| `avatars` | private أو public-read محدود | صور البروفايل | يفضّل private + signed، أو public-read فقط لو لا حساسية |

ملاحظات خصوصية:
- لا روابط عامة دائمة لوسائط الأطفال.
- سياسة احتفاظ/حذف للتسجيلات تُقرّر لاحقًا (Q5).
- الضيف لا يصل لأي bucket خاص.

---

## 7. Index Recommendations

- `profiles(role)` — تصفية حسب الدور.
- `children(profile_id)` unique — ربط الحساب.
- `parent_child_links(parent_id)`, `(child_id)` — بحث ثنائي الاتجاه (+ unique مركّب).
- `halaqas(teacher_id)`.
- `halaqa_members(child_id)`, `(halaqa_id)` (+ unique مركّب).
- `learning_materials(halaqa_id, sort_order)`.
- `material_lessons(material_id, sort_order)`.
- `student_assignments(halaqa_id, status)`, `(assigned_to_child_id)`.
- `submissions(child_id, state)`, `(assignment_id)`, `(state, created_at desc)` — قوائم المراجعة (الأحدث/المعلّق أولًا).
- `point_entries(child_id, created_at desc)`, `(material_id)`, **unique (child_id, source_type, source_id)**.
- `attendance(halaqa_id, lesson_ref)`, unique `(halaqa_id, lesson_ref, child_id)`.
- `wishes(child_id, status)`.
- `notifications(recipient_id, read_at)`, `(recipient_id, created_at desc)`.

---

## 8. Migration Notes (بدون تنفيذ الآن)

1. **Phase 1 (هذه الوثيقة):** اعتماد الـ schema + توحيد TypeScript types مشتركة بين demo والـ backend (مصدر نوع واحد، يطابق أسماء الأعمدة عبر mapper).
2. **Phase 2 — Auth/Profiles:** إنشاء `profiles` مرتبطة بـ `auth.users` + trigger لإنشاء profile عند التسجيل. تحديد سياسة الطفل (حساب مستقل أم parent-managed) قبل التنفيذ.
3. **Phase 3 — Materials/Lessons:** ترحيل خلف نفس الـ hooks (`useMaterialsForHalaqa`/`useLessonsForMaterial`) — تبديل المصدر فقط.
4. **Phase 4 — Assignments/Submissions/Points:** ترحيل التدفّق مع الحفاظ على dedupe key وانتقالات الحالة المحكومة بالدور.
5. **Phase 5 — Media Storage:** نقل من IndexedDB إلى bucket `submissions` خاص + signed URLs.
6. **Phase 6 — Notifications/Attendance/Wishes/Activities.**
7. **Phase 7 — إزالة fallback الـ localStorage تدريجيًا** بعد ثبات كل مرحلة.

مبادئ:
- لا حذف فعلي — أرشفة (`archived`/`status`).
- snapshots (`material_name`/`lesson_title`) تبقى لتماسك العرض بعد تعديل/أرشفة المصدر.
- `point_entries` upsert على مفتاح dedupe (يطابق `recordSourcedPoints`).
- التقدّم **مشتق وقت العرض** (لا يُخزَّن) — `earned/target` لكل مادة، ورحلة الشبل = متوسط الظاهرة.

---

## 9. Open Questions & Assumptions

**Answered / Approved (v1 — انظر «Approved Schema Decisions v1» أعلاه):**
- ✅ Q1 → الطفل **بلا** حساب auth مستقل الآن (`children.profile_id` nullable)؛ دخوله parent-managed/device لاحقًا.
- ✅ Q2 → **المعلم/المشرف** ينشئ الأطفال (أو seed/import) في MVP؛ ربط ولي الأمر لاحقًا عبر invite/code.
- ✅ Q3 → الـ schema يدعم التعدد؛ التنفيذ الأول **حلقة واحدة teacher-owned** (لا نبسّط `halaqa_members`، نؤجّل التعدد).
- ✅ Q5 → التسجيلات **غير دائمة افتراضيًا**؛ metadata تبقى، والاحتفاظ بالوسائط **سياسة configurable لاحقًا** (لا مدة نهائية الآن).
- ✅ Q6 → تكفي **الحالة على `submissions`** الآن؛ سجلّ التدقيق/التعديلات (`submission_reviews` / adjustment entries) **لاحقًا** عند الحاجة (مرتبط بقرار «لا تعديل نقاط في Phase 2»).
- ✅ Q7 → الضيف **read-only / demo-only لاحقًا**؛ لا وصول حقيقي في Phase 2.
- ✅ Q8 → **تأجيل SMS/WhatsApp**؛ Push لاحقًا؛ Phase 2 بلا notifications.

**Assumptions المعتمدة:**
- A1: المعلم/seed يُنشئ الأطفال في MVP؛ ربط ولي الأمر لاحقًا (مُحدّثة وفق Q2).
- A2: الطفل قد لا يملك حساب auth (`children.profile_id` nullable).
- A3: قد يكون الطفل في أكثر من حلقة (`halaqa_members` منفصل) — والتنفيذ الأول بحلقة واحدة.
- A4: موافقة ولي الأمر **إلزامية قبل** مراجعة المعلم دائمًا (للوسائط).
- A5: وسائط الأطفال private دائمًا.

**Open Questions (لا تزال تحتاج قرارًا):**
- Q4: هل `due_label` يبقى نصًّا أم يصبح `due_date timestamptz` فعليًا؟ (غير حاجب لـ Phase 2).
- (deferred config) المدة الدقيقة للاحتفاظ بالوسائط — تُحدّد كسياسة قابلة للضبط لاحقًا، ليست مفتوحة بل مؤجّلة.

---

_مسودة توثيقية فقط — لا migrations، لا كود، لا packages. قرارات v1 معتمدة؛ الخطوة التالية: **Phase 2 (Auth/Profiles)** — انظر `docs/AUTH_PROFILES_PHASE2_SCOPE.md`._
