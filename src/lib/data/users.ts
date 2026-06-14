import type { User } from "@/types";

const TS = "2026-06-01T08:00:00Z";

// 16 children + 10 parents + 2 teachers + 1 guest + 1 admin.
// NOTE: never expose this raw list to a viewer directly — use the scoped
// accessors in ./access.ts so role filtering is always applied.

const childNames = [
  "عبدالله", "طلال", "محمد", "سلمان",
  "خالد", "فهد", "ياسر", "عمر",
  "زياد", "راكان", "نواف", "تركي",
  "ماجد", "سعود", "بدر", "فيصل",
];

const parentNames = [
  "عبدالعزيز", "ناصر", "سعد", "إبراهيم", "يوسف",
  "عبدالرحمن", "حسن", "طارق", "وليد", "ماهر",
];

export const childUsers: User[] = childNames.map((name, i) => ({
  id: `u-c${i + 1}`,
  displayName: name,
  role: "child",
  createdAt: TS,
  updatedAt: TS,
}));

export const parentUsers: User[] = parentNames.map((name, i) => ({
  id: `u-p${i + 1}`,
  displayName: name,
  role: "parent",
  createdAt: TS,
  updatedAt: TS,
}));

export const teacherUsers: User[] = [
  { id: "u-t1", displayName: "الأستاذ أنس", role: "teacher", createdAt: TS, updatedAt: TS },
  { id: "u-t2", displayName: "الأستاذ بلال", role: "teacher", createdAt: TS, updatedAt: TS },
];

export const guestUsers: User[] = [
  { id: "u-g1", displayName: "ضيف الشرف", role: "guest", createdAt: TS, updatedAt: TS },
];

export const adminUsers: User[] = [
  { id: "u-a1", displayName: "المشرف العام", role: "admin", createdAt: TS, updatedAt: TS },
];

export const users: User[] = [
  ...childUsers,
  ...parentUsers,
  ...teacherUsers,
  ...guestUsers,
  ...adminUsers,
];
