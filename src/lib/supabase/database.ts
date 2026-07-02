/*
  Minimal Supabase `Database` generic (Phase 1b scaffolding).

  Only the tables the REAL (non-stub) data-access code touches need to be modelled
  for the typed client. The stub functions throw before any query, so they don't
  need table typings. Extend this as later phases wire real reads/writes, or
  replace it wholesale with generated types: `supabase gen types typescript`.
*/
import type { ChildDeviceGrant, Profile, TeacherProfile } from "./types";

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
