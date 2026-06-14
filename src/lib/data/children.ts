import type { ChildProfile, ParentChildLink } from "@/types";
import { childUsers } from "./users";

// Parent → children mapping (10 parents, 16 children):
//   p1→ch1,ch2  p2→ch3,ch4  p3→ch5,ch6  p4→ch7,ch8
//   p5→ch9,ch10 p6→ch11,ch12
//   p7→ch13  p8→ch14  p9→ch15  p10→ch16
const childToParent: Record<number, string> = {
  1: "u-p1", 2: "u-p1", 3: "u-p2", 4: "u-p2",
  5: "u-p3", 6: "u-p3", 7: "u-p4", 8: "u-p4",
  9: "u-p5", 10: "u-p5", 11: "u-p6", 12: "u-p6",
  13: "u-p7", 14: "u-p8", 15: "u-p9", 16: "u-p10",
};

function halaqaForChild(index: number): string {
  return index <= 8 ? "h1" : "h2";
}

export const childProfiles: ChildProfile[] = childUsers.map((u, i) => {
  const n = i + 1;
  return {
    id: `ch${n}`,
    userId: u.id,
    displayName: u.displayName,
    age: 7 + (n % 6), // 7..12, deterministic mock
    halaqaId: halaqaForChild(n),
    parentIds: [childToParent[n]],
    isActive: true,
  };
});

export const parentChildLinks: ParentChildLink[] = childProfiles.map((c, i) => ({
  id: `pcl${i + 1}`,
  parentId: c.parentIds[0],
  childId: c.id,
  relationshipLabel: "father",
  canApproveVideos: true,
  canViewWishes: true,
}));
