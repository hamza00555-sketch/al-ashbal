import type { Wish } from "@/types";

// Wishes are always parent_only. They must NEVER surface to teacher / guest.
export const wishes: Wish[] = [
  {
    id: "w1",
    childId: "ch1",
    title: "كتاب جديد",
    description: "قصة عن الأنبياء",
    visibility: "parent_only",
    status: "seen_by_parent",
    parentAction: "keep",
    createdAt: "2026-06-10T12:00:00Z",
    updatedAt: "2026-06-12T12:00:00Z",
  },
  {
    id: "w2",
    childId: "ch1",
    title: "طلعة مع بابا",
    visibility: "parent_only",
    status: "idea",
    createdAt: "2026-06-13T12:00:00Z",
    updatedAt: "2026-06-13T12:00:00Z",
  },
  {
    id: "w3",
    childId: "ch5",
    title: "تجربة عائلية",
    visibility: "parent_only",
    status: "saved",
    parentAction: "convert_to_goal",
    createdAt: "2026-06-09T12:00:00Z",
    updatedAt: "2026-06-11T12:00:00Z",
  },
  {
    id: "w4",
    childId: "ch9",
    title: "هدية بسيطة",
    visibility: "parent_only",
    status: "idea",
    createdAt: "2026-06-13T12:00:00Z",
    updatedAt: "2026-06-13T12:00:00Z",
  },
];
