export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          target: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          target?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          bio: string | null
          created_at: string
          game_date: string | null
          game_datetime: string | null
          game_time: string | null
          game_id: string
          id: string
          image_url: string | null
          name: string
          rules: string | null
          status: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          game_date?: string | null
          game_datetime?: string | null
          game_time?: string | null
          game_id: string
          id?: string
          image_url?: string | null
          name: string
          rules?: string | null
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          game_date?: string | null
          game_datetime?: string | null
          game_time?: string | null
          game_id?: string
          id?: string
          image_url?: string | null
          name?: string
          rules?: string | null
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      hall_of_fame: {
        Row: {
          id: string
          player_id: string | null
          rank: number
          season: number
        }
        Insert: {
          id?: string
          player_id?: string | null
          rank: number
          season: number
        }
        Update: {
          id?: string
          player_id?: string | null
          rank?: number
          season?: number
        }
        Relationships: [
          {
            foreignKeyName: "hall_of_fame_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          events_completed: number
          games_played: number
          id: string
          player_id: string
          points: number
          rank: number | null
          seconds: number
          thirds: number
          updated_at: string
          wins: number
        }
        Insert: {
          events_completed?: number
          games_played?: number
          id?: string
          player_id: string
          points?: number
          rank?: number | null
          seconds?: number
          thirds?: number
          updated_at?: string
          wins?: number
        }
        Update: {
          events_completed?: number
          games_played?: number
          id?: string
          player_id?: string
          points?: number
          rank?: number | null
          seconds?: number
          thirds?: number
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_game_stats: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_id: string
          points: number
          rank: number | null
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_id: string
          points?: number
          rank?: number | null
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_id?: string
          points?: number
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_game_stats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_game_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_items: {
        Row: {
          assigned_at: string
          id: string
          item_id: string
          player_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          item_id: string
          player_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          item_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_items_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_proficiencies: {
        Row: {
          game_name: string
          id: string
          player_id: string
          proficiency_percent: number
        }
        Insert: {
          game_name: string
          id?: string
          player_id: string
          proficiency_percent?: number
        }
        Update: {
          game_name?: string
          id?: string
          player_id?: string
          proficiency_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_proficiencies_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          instagram: string | null
          linkedin: string | null
          name: string
          player_id: string
          portrait_url: string | null
          twitter: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram?: string | null
          linkedin?: string | null
          name: string
          player_id: string
          portrait_url?: string | null
          twitter?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram?: string | null
          linkedin?: string | null
          name?: string
          player_id?: string
          portrait_url?: string | null
          twitter?: string | null
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
