// types/database.ts
// Supabase Database Types for IRA Web
// Based on actual schema (24 tables)

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
          email: string | null
          display_name: string | null
          full_name: string | null
          avatar_url: string | null
          role: string
          subscription_tier: 'free' | 'premium' | 'pro'
          preferences: Json
          country: string | null
          racing_category: string | null
          chassis_brand: string | null
          engine: string | null
          experience_level: string | null
          coaching_tone: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      drivers: {
        Row: {
          id: string
          user_id: string
          name: string
          nickname: string | null
          date_of_birth: string | null
          kart_class: string | null
          chassis: string | null
          engine: string | null
          race_number: string | null
          avatar_url: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['drivers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          driver_id: string | null
          track_id: string | null
          name: string | null
          session_date: string
          session_type: string | null
          weather: string | null
          temperature_celsius: number | null
          track_condition: string | null
          data_source: 'mychron' | 'racechrono' | 'aim' | 'alfano' | 'unknown'
          original_filename: string | null
          status: 'pending' | 'processing' | 'complete' | 'error'
          total_laps: number | null
          best_lap_time_ms: number | null
          total_distance_meters: number | null
          total_duration_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      laps: {
        Row: {
          id: string
          session_id: string
          lap_number: number
          lap_time_ms: number | null
          is_valid: boolean
          is_best: boolean
          invalidation_reason: string | null
          sector1_ms: number | null
          sector2_ms: number | null
          sector3_ms: number | null
          max_speed_kmh: number | null
          avg_speed_kmh: number | null
          distance_meters: number | null
          start_time: number | null
          end_time: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['laps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['laps']['Insert']>
      }
      telemetry_points: {
        Row: {
          id: string
          lap_id: string
          timestamp: number
          distance_meters: number | null
          latitude: number | null
          longitude: number | null
          altitude: number | null
          gps_speed_kmh: number | null
          gps_heading: number | null
          rpm: number | null
          exhaust_temp_celsius: number | null
          water_temp_celsius: number | null
          lateral_g: number | null
          longitudinal_g: number | null
          is_beacon: boolean
          beacon_number: number | null
        }
        Insert: Omit<Database['public']['Tables']['telemetry_points']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['telemetry_points']['Insert']>
      }
      tracks: {
        Row: {
          id: string
          name: string
          country: string | null
          city: string | null
          latitude: number | null
          longitude: number | null
          length_meters: number | null
          direction: string | null
          surface: string
          track_map_url: string | null
          is_official: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tracks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>
      }
      ai_insights: {
        Row: {
          id: string
          session_id: string | null
          lap_id: string | null
          user_id: string | null
          insight_type: string
          title: string | null
          summary: string | null
          detailed_analysis: string | null
          recommendations: Json | null
          model_version: string | null
          confidence_score: number | null
          tokens_used: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_insights']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ai_insights']['Insert']>
      }
      driver_levels: {
        Row: {
          id: string
          driver_id: string
          current_level: number
          current_xp: number
          total_xp: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['driver_levels']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['driver_levels']['Insert']>
      }
      achievements: {
        Row: {
          id: string
          code: string
          name: string
          name_key: string
          description: string | null
          description_key: string
          category: string
          xp_reward: number
          badge_emoji: string
          badge_color: string
          requirement_type: string
          requirement_value: number | null
          is_hidden: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          driver_id: string
          notification_style: 'family' | 'technical' | 'motivation'
          live_notifications: boolean
          summary_notifications: boolean
          approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_follows']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_follows']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'premium' | 'pro'
      data_source: 'mychron' | 'racechrono' | 'aim' | 'alfano' | 'unknown'
      session_status: 'pending' | 'processing' | 'complete' | 'error'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type Driver = Tables<'drivers'>
export type Session = Tables<'sessions'>
export type Lap = Tables<'laps'>
export type TelemetryPoint = Tables<'telemetry_points'>
export type Track = Tables<'tracks'>
export type AiInsight = Tables<'ai_insights'>
export type DriverLevel = Tables<'driver_levels'>
export type Achievement = Tables<'achievements'>
export type UserFollow = Tables<'user_follows'>

// Session with related data
export type SessionWithDetails = Session & {
  track?: Track | null
  driver?: Driver | null
  laps?: Lap[]
}

// Lap with telemetry
export type LapWithTelemetry = Lap & {
  telemetry_points?: TelemetryPoint[]
}
