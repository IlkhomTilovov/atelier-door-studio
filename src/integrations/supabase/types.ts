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
      door_colors: {
        Row: {
          created_at: string
          enabled: boolean
          hex: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          hex?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          hex?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      door_model_colors: {
        Row: {
          color_id: string
          created_at: string
          door_id: string
          id: string
        }
        Insert: {
          color_id: string
          created_at?: string
          door_id: string
          id?: string
        }
        Update: {
          color_id?: string
          created_at?: string
          door_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "door_model_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "door_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "door_model_colors_door_id_fkey"
            columns: ["door_id"]
            isOneToOne: false
            referencedRelation: "doors"
            referencedColumns: ["id"]
          },
        ]
      }
      doors: {
        Row: {
          collection: string
          created_at: string
          enabled: boolean
          id: string
          image_url: string | null
          molding_style: string
          name: string
          panel_count: number
          sort_order: number
        }
        Insert: {
          collection?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          molding_style?: string
          name: string
          panel_count?: number
          sort_order?: number
        }
        Update: {
          collection?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          molding_style?: string
          name?: string
          panel_count?: number
          sort_order?: number
        }
        Relationships: []
      }
      floors: {
        Row: {
          color: string
          created_at: string
          enabled: boolean
          id: string
          image_url: string | null
          name: string
          pattern: string
          sort_order: number
          texture_orientation: string
          texture_scale: string
        }
        Insert: {
          color?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          name: string
          pattern?: string
          sort_order?: number
          texture_orientation?: string
          texture_scale?: string
        }
        Update: {
          color?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          name?: string
          pattern?: string
          sort_order?: number
          texture_orientation?: string
          texture_scale?: string
        }
        Relationships: []
      }
      room_categories: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      room_doors: {
        Row: {
          created_at: string
          door_id: string
          id: string
          wall_id: string
        }
        Insert: {
          created_at?: string
          door_id: string
          id?: string
          wall_id: string
        }
        Update: {
          created_at?: string
          door_id?: string
          id?: string
          wall_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_doors_door_id_fkey"
            columns: ["door_id"]
            isOneToOne: false
            referencedRelation: "doors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_doors_wall_id_fkey"
            columns: ["wall_id"]
            isOneToOne: false
            referencedRelation: "walls"
            referencedColumns: ["id"]
          },
        ]
      }
      room_floors: {
        Row: {
          created_at: string
          floor_id: string
          id: string
          wall_id: string
        }
        Insert: {
          created_at?: string
          floor_id: string
          id?: string
          wall_id: string
        }
        Update: {
          created_at?: string
          floor_id?: string
          id?: string
          wall_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_floors_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_floors_wall_id_fkey"
            columns: ["wall_id"]
            isOneToOne: false
            referencedRelation: "walls"
            referencedColumns: ["id"]
          },
        ]
      }
      walls: {
        Row: {
          category_id: string | null
          color: string
          created_at: string
          enabled: boolean
          id: string
          image_url: string | null
          molding_type: string
          name: string
          sort_order: number
        }
        Insert: {
          category_id?: string | null
          color?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          molding_type?: string
          name: string
          sort_order?: number
        }
        Update: {
          category_id?: string | null
          color?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          molding_type?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "walls_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "room_categories"
            referencedColumns: ["id"]
          },
        ]
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
