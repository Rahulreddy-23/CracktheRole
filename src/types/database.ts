export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Matches the shape produced by `supabase gen types typescript`.
// Supabase JS v2 type resolution requires `type` (not `interface`),
// `Relationships` on each table, and `CompositeTypes` in the schema.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          job_title: string | null;
          years_of_experience: number | null;
          location: string | null;
          skills: string[] | null;
          avatar_url: string | null;
          onboarded: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          job_title?: string | null;
          years_of_experience?: number | null;
          location?: string | null;
          skills?: string[] | null;
          avatar_url?: string | null;
          onboarded?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          job_title?: string | null;
          years_of_experience?: number | null;
          location?: string | null;
          skills?: string[] | null;
          avatar_url?: string | null;
          onboarded?: boolean;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          job_role: string;
          difficulty: string;
          interview_type: string;
          target_company: string | null;
          duration_minutes: number;
          status: "pending" | "in_progress" | "completed";
          overall_score: number | null;
          technical_score: number | null;
          communication_score: number | null;
          problem_solving_score: number | null;
          feedback: string | null;
          transcript: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          job_role: string;
          difficulty: string;
          interview_type: string;
          target_company?: string | null;
          duration_minutes: number;
          status?: "pending" | "in_progress" | "completed";
          overall_score?: number | null;
          technical_score?: number | null;
          communication_score?: number | null;
          problem_solving_score?: number | null;
          feedback?: string | null;
          transcript?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          job_role?: string;
          difficulty?: string;
          interview_type?: string;
          target_company?: string | null;
          duration_minutes?: number;
          status?: "pending" | "in_progress" | "completed";
          overall_score?: number | null;
          technical_score?: number | null;
          communication_score?: number | null;
          problem_solving_score?: number | null;
          feedback?: string | null;
          transcript?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
