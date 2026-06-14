# Data Model — الأشبال

هذه نسخة أولية للـ data model. لا تعتبر نهائية قبل Discovery Lock.

## Users

```ts
type UserRole = 'child' | 'parent' | 'teacher' | 'guest' | 'admin';

interface User {
  id: string;
  displayName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Children

```ts
interface ChildProfile {
  id: string;
  userId?: string;
  displayName: string;
  age?: number;
  halaqaId: string;
  parentIds: string[];
  isActive: boolean;
}
```

## Parent Links

```ts
interface ParentChildLink {
  id: string;
  parentId: string;
  childId: string;
  relationshipLabel?: 'father' | 'mother' | 'guardian' | 'other';
  canApproveVideos: boolean;
  canViewWishes: boolean;
}
```

## Halaqas

```ts
interface Halaqa {
  id: string;
  name: string;
  teacherIds: string[];
  childIds: string[];
  defaultMeetUrl?: string;
}
```

## Lessons

```ts
interface Lesson {
  id: string;
  halaqaId: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  meetUrl?: string;
  quranSegment?: string;
  tajweedTopic?: string;
  behaviorTopic?: string;
  notes?: string;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
}
```

## Attendance

```ts
interface AttendanceRecord {
  id: string;
  lessonId: string;
  childId: string;
  status: 'present' | 'late' | 'absent' | 'excused' | 'manual_override';
  joinedAt?: string;
  updatedBy?: string;
  note?: string;
}
```

## Recitations / Videos

```ts
interface RecitationSubmission {
  id: string;
  childId: string;
  lessonId?: string;
  title: string;
  videoUrl?: string;
  durationSeconds?: number;
  status:
    | 'recorded'
    | 'pending_parent_approval'
    | 'parent_rejected'
    | 'pending_teacher_review'
    | 'teacher_reviewed'
    | 'deleted';
  parentApprovalId?: string;
  teacherReviewId?: string;
  expiresAt?: string;
}
```

## Parent Approval

```ts
interface ParentApproval {
  id: string;
  recitationId: string;
  parentId: string;
  decision: 'approved' | 'request_rerecord';
  reason?: string;
  createdAt: string;
}
```

## Teacher Review

```ts
interface TeacherReview {
  id: string;
  recitationId: string;
  teacherId: string;
  quranScore?: number;
  tajweedScore?: number;
  behaviorNote?: string;
  teacherNote?: string;
  badgeIds?: string[];
  createdAt: string;
}
```

## Progress

```ts
interface ProgressSnapshot {
  id: string;
  childId: string;
  quranPercent: number;
  tajweedPercent: number;
  behaviorPercent: number;
  totalPoints: number;
  currentProgressBar: {
    label: string;
    current: number;
    target: number;
  };
}
```

## Badges

```ts
interface Badge {
  id: string;
  title: string;
  category: 'quran' | 'tajweed' | 'behavior' | 'progress' | 'special';
  description?: string;
  icon?: string;
}
```

## Wishes

```ts
interface Wish {
  id: string;
  childId: string;
  title: string;
  description?: string;
  visibility: 'parent_only';
  status: 'idea' | 'seen_by_parent' | 'saved' | 'converted_to_goal' | 'archived';
  parentAction?: 'keep' | 'convert_to_goal' | 'reward_badge' | 'not_now';
  createdAt: string;
  updatedAt: string;
}
```

## Notifications

```ts
interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type:
    | 'lesson_reminder'
    | 'video_pending_parent'
    | 'video_pending_teacher'
    | 'teacher_summary'
    | 'badge_awarded'
    | 'wish_seen'
    | 'progress_completed';
  readAt?: string;
  createdAt: string;
}
```
