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
          full_name: string | null;
          avatar_url: string | null;
          target_role: string;
          target_companies: string[];
          current_ctc: number;
          target_ctc: number;
          experience_years: number;
          prep_timeline: string;
          subscription_tier: "free" | "pro" | "elite";
          streak_count: number;
          last_active_date: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          target_role?: string;
          target_companies?: string[];
          current_ctc?: number;
          target_ctc?: number;
          experience_years?: number;
          prep_timeline?: string;
          subscription_tier?: "free" | "pro" | "elite";
          streak_count?: number;
          last_active_date?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          target_role?: string;
          target_companies?: string[];
          current_ctc?: number;
          target_ctc?: number;
          experience_years?: number;
          prep_timeline?: string;
          subscription_tier?: "free" | "pro" | "elite";
          streak_count?: number;
          last_active_date?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interview_sessions: {
        Row: {
          id: string;
          user_id: string;
          interview_type: "dsa" | "system_design" | "behavioral" | "sql";
          difficulty: "easy" | "medium" | "hard";
          company_context: string | null;
          messages: Json;
          score_technical: number | null;
          score_communication: number | null;
          score_problem_solving: number | null;
          score_time_management: number | null;
          overall_score: number | null;
          feedback_summary: string | null;
          strengths: string[] | null;
          improvements: string[] | null;
          duration_seconds: number | null;
          status: "in_progress" | "completed" | "abandoned";
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          interview_type: "dsa" | "system_design" | "behavioral" | "sql";
          difficulty: "easy" | "medium" | "hard";
          company_context?: string | null;
          messages?: Json;
          score_technical?: number | null;
          score_communication?: number | null;
          score_problem_solving?: number | null;
          score_time_management?: number | null;
          overall_score?: number | null;
          feedback_summary?: string | null;
          strengths?: string[] | null;
          improvements?: string[] | null;
          duration_seconds?: number | null;
          status?: "in_progress" | "completed" | "abandoned";
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          interview_type?: "dsa" | "system_design" | "behavioral" | "sql";
          difficulty?: "easy" | "medium" | "hard";
          company_context?: string | null;
          messages?: Json;
          score_technical?: number | null;
          score_communication?: number | null;
          score_problem_solving?: number | null;
          score_time_management?: number | null;
          overall_score?: number | null;
          feedback_summary?: string | null;
          strengths?: string[] | null;
          improvements?: string[] | null;
          duration_seconds?: number | null;
          status?: "in_progress" | "completed" | "abandoned";
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: "dsa" | "system_design" | "behavioral" | "sql";
          difficulty: "easy" | "medium" | "hard";
          company_tags: string[];
          topic_tags: string[];
          hints: string[];
          solution: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: "dsa" | "system_design" | "behavioral" | "sql";
          difficulty: "easy" | "medium" | "hard";
          company_tags?: string[];
          topic_tags?: string[];
          hints?: string[];
          solution?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: "dsa" | "system_design" | "behavioral" | "sql";
          difficulty?: "easy" | "medium" | "hard";
          company_tags?: string[];
          topic_tags?: string[];
          hints?: string[];
          solution?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_challenges: {
        Row: {
          id: string;
          question_id: string;
          challenge_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          challenge_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          challenge_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      challenge_completions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          tier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          tier: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          tier?: string;
          created_at?: string;
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
