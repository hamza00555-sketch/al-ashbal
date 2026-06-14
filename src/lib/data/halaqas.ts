import type { Halaqa } from "@/types";

// Two halaqas so "a teacher sees only their halaqa" is demonstrable:
//   h1 → teacher u-t1, children ch1..ch8
//   h2 → teacher u-t2, children ch9..ch16
export const halaqas: Halaqa[] = [
  {
    id: "h1",
    name: "حلقة الفجر",
    teacherIds: ["u-t1"],
    childIds: ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "ch8"],
    defaultMeetUrl: "mock://meet/h1",
  },
  {
    id: "h2",
    name: "حلقة الضحى",
    teacherIds: ["u-t2"],
    childIds: ["ch9", "ch10", "ch11", "ch12", "ch13", "ch14", "ch15", "ch16"],
    defaultMeetUrl: "mock://meet/h2",
  },
];
