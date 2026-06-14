import type { AttendanceRecord, Lesson } from "@/types";

export const lessons: Lesson[] = [
  {
    id: "l1",
    halaqaId: "h1",
    title: "درس سورة الملك",
    date: "2026-06-13",
    startTime: "06:30",
    endTime: "07:15",
    meetUrl: "mock://meet/h1",
    quranSegment: "الملك 1-11",
    tajweedTopic: "المدود",
    behaviorTopic: "الصدق",
    status: "completed",
  },
  {
    id: "l2",
    halaqaId: "h1",
    title: "درس سورة الملك (تتمة)",
    date: "2026-06-14",
    startTime: "06:30",
    meetUrl: "mock://meet/h1",
    quranSegment: "الملك 12-30",
    tajweedTopic: "الغنة",
    behaviorTopic: "التعاون",
    status: "scheduled",
  },
  {
    id: "l3",
    halaqaId: "h2",
    title: "درس سورة القلم",
    date: "2026-06-13",
    startTime: "09:00",
    endTime: "09:45",
    meetUrl: "mock://meet/h2",
    quranSegment: "القلم 1-16",
    tajweedTopic: "المخارج",
    behaviorTopic: "الاحترام",
    status: "completed",
  },
  {
    id: "l4",
    halaqaId: "h2",
    title: "درس سورة القلم (تتمة)",
    date: "2026-06-14",
    startTime: "09:00",
    meetUrl: "mock://meet/h2",
    status: "live",
  },
];

// Attendance for the two completed lessons (subset of children, per halaqa).
export const attendanceRecords: AttendanceRecord[] = [
  { id: "att1", lessonId: "l1", childId: "ch1", status: "present", joinedAt: "2026-06-13T06:31:00Z" },
  { id: "att2", lessonId: "l1", childId: "ch2", status: "late", joinedAt: "2026-06-13T06:42:00Z" },
  { id: "att3", lessonId: "l1", childId: "ch3", status: "present", joinedAt: "2026-06-13T06:30:00Z" },
  { id: "att4", lessonId: "l1", childId: "ch4", status: "excused", note: "ظرف عائلي" },
  { id: "att5", lessonId: "l1", childId: "ch5", status: "absent" },
  { id: "att6", lessonId: "l1", childId: "ch6", status: "present", joinedAt: "2026-06-13T06:33:00Z" },
  { id: "att7", lessonId: "l3", childId: "ch9", status: "present", joinedAt: "2026-06-13T09:01:00Z" },
  { id: "att8", lessonId: "l3", childId: "ch10", status: "late", joinedAt: "2026-06-13T09:10:00Z" },
  { id: "att9", lessonId: "l3", childId: "ch11", status: "present", joinedAt: "2026-06-13T09:00:00Z" },
];
