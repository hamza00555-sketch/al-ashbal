/*
  Minimal Supabase `Database` generic (Phase 1b scaffolding).

  Only the tables the REAL (non-stub) data-access code touches need to be modelled
  for the typed client. The stub functions throw before any query, so they don't
  need table typings. Extend this as later phases wire real reads/writes, or
  replace it wholesale with generated types: `supabase gen types typescript`.
*/
import type {
  Child,
  ChildDeviceGrant,
  ClassRow,
  ClassStudent,
  ClassTeacher,
  Invitation,
  InvitationUse,
  JoinRequest,
  ParentChildLink,
  ParentProfile,
  Profile,
  TeacherProfile,
} from "./types";

type Empty = Record<string, never>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & {
          id: string;
          role: Profile["role"];
          display_name: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      teacher_profiles: {
        Row: TeacherProfile;
        Insert: Partial<TeacherProfile> & { id: string };
        Update: Partial<TeacherProfile>;
        Relationships: [];
      };
      parent_profiles: {
        Row: ParentProfile;
        Insert: Partial<ParentProfile> & { id: string };
        Update: Partial<ParentProfile>;
        Relationships: [];
      };
      classes: {
        Row: ClassRow;
        Insert: Partial<ClassRow> & { name: string };
        Update: Partial<ClassRow>;
        Relationships: [];
      };
      class_teachers: {
        Row: ClassTeacher;
        Insert: Partial<ClassTeacher> & { class_id: string; teacher_id: string };
        Update: Partial<ClassTeacher>;
        Relationships: [];
      };
      invitations: {
        Row: Invitation;
        Insert: Partial<Invitation> & {
          type: Invitation["type"];
          code: string;
          class_id: string;
          created_by_teacher_id: string;
        };
        Update: Partial<Invitation>;
        Relationships: [];
      };
      invitation_uses: {
        Row: InvitationUse;
        Insert: Partial<InvitationUse> & { invitation_id: string };
        Update: Partial<InvitationUse>;
        Relationships: [];
      };
      children: {
        Row: Child;
        Insert: Partial<Child> & { display_name: string };
        Update: Partial<Child>;
        Relationships: [];
      };
      class_students: {
        Row: ClassStudent;
        Insert: Partial<ClassStudent> & { class_id: string; child_id: string };
        Update: Partial<ClassStudent>;
        Relationships: [];
      };
      parent_child_links: {
        Row: ParentChildLink;
        Insert: Partial<ParentChildLink> & { parent_id: string; child_id: string };
        Update: Partial<ParentChildLink>;
        Relationships: [];
      };
      join_requests: {
        Row: JoinRequest;
        Insert: Partial<JoinRequest> & {
          email: string;
          display_name: string;
          requested_role: JoinRequest["requested_role"];
        };
        Update: Partial<JoinRequest>;
        Relationships: [];
      };
      child_device_grants: {
        Row: ChildDeviceGrant;
        Insert: Partial<ChildDeviceGrant> & {
          child_id: string;
          grant_token_hash: string;
        };
        Update: Partial<ChildDeviceGrant>;
        Relationships: [];
      };
    };
    Views: Empty;
    Functions: Empty;
    Enums: Empty;
    CompositeTypes: Empty;
  };
}
