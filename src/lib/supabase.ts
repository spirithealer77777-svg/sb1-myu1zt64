import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          current_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          current_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          current_level?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      vocabulary: {
        Row: {
          id: string;
          japanese: string;
          hiragana: string;
          burmese: string;
          english: string;
          level: string;
          category: string;
          example_sentence: string | null;
          example_burmese: string | null;
          created_at: string;
        };
      };
      grammar_points: {
        Row: {
          id: string;
          pattern: string;
          meaning: string;
          burmese_explanation: string;
          english_explanation: string;
          level: string;
          examples: any[];
          created_at: string;
        };
      };
      kaiwa_scenarios: {
        Row: {
          id: string;
          title: string;
          title_burmese: string;
          level: string;
          situation: string;
          dialogue: any[];
          key_phrases: any[];
          created_at: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          item_id: string;
          mastery_level: number;
          last_reviewed: string;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: string;
          item_id: string;
          mastery_level?: number;
          last_reviewed?: string;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_type?: string;
          item_id?: string;
          mastery_level?: number;
          last_reviewed?: string;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_chat_history: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          role: string;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          role: string;
          language?: string;
          created_at?: string;
        };
      };
    };
  };
};
