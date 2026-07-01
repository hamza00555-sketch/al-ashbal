/*
  Shared child-registration options (previously duplicated in JoinFlow,
  StudentOnboarding, and LinkChildPicker). Pure constants — server/client safe.
*/

/** Selectable child avatars: [boy, girl]. Gender is derived from the choice. */
export const CHILD_AVATARS = [
  { src: "/assets/avatars/avatar_child_boy_01.png", label: "ولد" },
  { src: "/assets/avatars/avatar_child_girl_01.png", label: "بنت" },
] as const;

/** Learning levels offered at registration. */
export const CHILD_LEVELS = ["مبتدئ", "متوسط", "متقدم"] as const;
