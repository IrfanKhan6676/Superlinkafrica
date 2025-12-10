export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          image_url: string
          user_id: string
          storage_path: string
          size: number
          mime_type: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          image_url: string
          user_id: string
          storage_path: string
          size: number
          mime_type?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          image_url?: string
          user_id?: string
          storage_path?: string
          size?: number
          mime_type?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
