import type { Badge, ProgressSnapshot } from "@/types";
import { childProfiles } from "./children";

// Badge catalog (from the brand book). Awarding happens via TeacherReview.badgeIds.
export const badges: Badge[] = [
  { id: "b-quran-1", title: "وسام المثابر", category: "quran", description: "مواظبة على التسميع" },
  { id: "b-quran-2", title: "وسام التلاوة الواضحة", category: "quran" },
  { id: "b-quran-3", title: "وسام المراجعة", category: "quran" },
  { id: "b-tajweed-1", title: "صديق المدود", category: "tajweed" },
  { id: "b-tajweed-2", title: "فارس الغنة", category: "tajweed" },
  { id: "b-behavior-1", title: "شبل الصدق", category: "behavior" },
  { id: "b-behavior-2", title: "شبل التعاون", category: "behavior" },
  { id: "b-progress-1", title: "أنجزت مرحلة", category: "progress" },
];

// Deterministic per-child progress snapshot (mock, not real metrics).
export const progressSnapshots: ProgressSnapshot[] = childProfiles.map((c, i) => {
  const n = i + 1;
  const quran = 40 + ((n * 7) % 55); // 40..94
  const tajweed = 35 + ((n * 5) % 60);
  const behavior = 50 + ((n * 3) % 45);
  const current = (n * 13) % 100;
  return {
    id: `prog-${c.id}`,
    childId: c.id,
    quranPercent: quran,
    tajweedPercent: tajweed,
    behaviorPercent: behavior,
    totalPoints: quran + tajweed + behavior,
    currentProgressBar: {
      label: "رحلة الشبل",
      current,
      target: 100,
    },
  };
});
