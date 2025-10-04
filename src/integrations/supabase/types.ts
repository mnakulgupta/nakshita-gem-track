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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      design_details: {
        Row: {
          cad_by: string | null
          cad_completion_date: string | null
          cad_file_link: string | null
          cad_photo_url: string | null
          cam_received_date: string | null
          cam_sent_date: string | null
          cam_vendor: string | null
          cam_weight_grams: number | null
          created_at: string | null
          date: string | null
          dye_creation_date: string | null
          dye_vendor: string | null
          dye_weight: number | null
          final_dye_no: string | null
          id: string
          jobcard_id: string | null
          size_dimensions: string | null
          stone_specifications: string | null
          updated_at: string | null
        }
        Insert: {
          cad_by?: string | null
          cad_completion_date?: string | null
          cad_file_link?: string | null
          cad_photo_url?: string | null
          cam_received_date?: string | null
          cam_sent_date?: string | null
          cam_vendor?: string | null
          cam_weight_grams?: number | null
          created_at?: string | null
          date?: string | null
          dye_creation_date?: string | null
          dye_vendor?: string | null
          dye_weight?: number | null
          final_dye_no?: string | null
          id?: string
          jobcard_id?: string | null
          size_dimensions?: string | null
          stone_specifications?: string | null
          updated_at?: string | null
        }
        Update: {
          cad_by?: string | null
          cad_completion_date?: string | null
          cad_file_link?: string | null
          cad_photo_url?: string | null
          cam_received_date?: string | null
          cam_sent_date?: string | null
          cam_vendor?: string | null
          cam_weight_grams?: number | null
          created_at?: string | null
          date?: string | null
          dye_creation_date?: string | null
          dye_vendor?: string | null
          dye_weight?: number | null
          final_dye_no?: string | null
          id?: string
          jobcard_id?: string | null
          size_dimensions?: string | null
          stone_specifications?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_details_jobcard_id_fkey"
            columns: ["jobcard_id"]
            isOneToOne: false
            referencedRelation: "jobcards"
            referencedColumns: ["id"]
          },
        ]
      }
      dye_details: {
        Row: {
          created_at: string | null
          dye_creation_date: string | null
          dye_number: string
          dye_vendor: string | null
          dye_weight: number | null
          id: string
          jobcard_id: string | null
          notes: string | null
          part_name: string | null
          sku_number: string | null
          updated_at: string | null
          wax_pcs_per_dye: number | null
        }
        Insert: {
          created_at?: string | null
          dye_creation_date?: string | null
          dye_number: string
          dye_vendor?: string | null
          dye_weight?: number | null
          id?: string
          jobcard_id?: string | null
          notes?: string | null
          part_name?: string | null
          sku_number?: string | null
          updated_at?: string | null
          wax_pcs_per_dye?: number | null
        }
        Update: {
          created_at?: string | null
          dye_creation_date?: string | null
          dye_number?: string
          dye_vendor?: string | null
          dye_weight?: number | null
          id?: string
          jobcard_id?: string | null
          notes?: string | null
          part_name?: string | null
          sku_number?: string | null
          updated_at?: string | null
          wax_pcs_per_dye?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dye_details_jobcard_id_fkey"
            columns: ["jobcard_id"]
            isOneToOne: false
            referencedRelation: "jobcards"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          cancellation_reason: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          due_date: string | null
          id: string
          inquiry_id: string
          metal_details: string | null
          order_type: string | null
          pm_review_status: Database["public"]["Enums"]["inquiry_status"]
          polish_color: string | null
          product_category:
            | Database["public"]["Enums"]["product_category"]
            | null
          quantity: number
          reference_image_url: string | null
          sales_person_id: string | null
          special_instructions: string | null
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          inquiry_id: string
          metal_details?: string | null
          order_type?: string | null
          pm_review_status?: Database["public"]["Enums"]["inquiry_status"]
          polish_color?: string | null
          product_category?:
            | Database["public"]["Enums"]["product_category"]
            | null
          quantity?: number
          reference_image_url?: string | null
          sales_person_id?: string | null
          special_instructions?: string | null
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          inquiry_id?: string
          metal_details?: string | null
          order_type?: string | null
          pm_review_status?: Database["public"]["Enums"]["inquiry_status"]
          polish_color?: string | null
          product_category?:
            | Database["public"]["Enums"]["product_category"]
            | null
          quantity?: number
          reference_image_url?: string | null
          sales_person_id?: string | null
          special_instructions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobcards: {
        Row: {
          created_at: string | null
          current_stage: string | null
          id: string
          inquiry_id: string | null
          jobcard_no: string
          order_type: string
          product_category: Database["public"]["Enums"]["product_category"]
          pushed_to_workshop: boolean | null
          sku_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stage?: string | null
          id?: string
          inquiry_id?: string | null
          jobcard_no: string
          order_type: string
          product_category: Database["public"]["Enums"]["product_category"]
          pushed_to_workshop?: boolean | null
          sku_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stage?: string | null
          id?: string
          inquiry_id?: string | null
          jobcard_no?: string
          order_type?: string
          product_category?: Database["public"]["Enums"]["product_category"]
          pushed_to_workshop?: boolean | null
          sku_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobcards_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories_config: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          default_stages: string[] | null
          display_name: string
          id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          default_stages?: string[] | null
          display_name: string
          id?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          default_stages?: string[] | null
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      production_stages_config: {
        Row: {
          created_at: string | null
          department: string
          id: string
          is_design_stage: boolean | null
          product_category: Database["public"]["Enums"]["product_category"]
          stage_name: string
          stage_order: number
          track_pcs_in: boolean | null
          track_pcs_out: boolean | null
          track_weight_in: boolean | null
          track_weight_out: boolean | null
        }
        Insert: {
          created_at?: string | null
          department: string
          id?: string
          is_design_stage?: boolean | null
          product_category: Database["public"]["Enums"]["product_category"]
          stage_name: string
          stage_order: number
          track_pcs_in?: boolean | null
          track_pcs_out?: boolean | null
          track_weight_in?: boolean | null
          track_weight_out?: boolean | null
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          is_design_stage?: boolean | null
          product_category?: Database["public"]["Enums"]["product_category"]
          stage_name?: string
          stage_order?: number
          track_pcs_in?: boolean | null
          track_pcs_out?: boolean | null
          track_weight_in?: boolean | null
          track_weight_out?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stage_tracking: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          department: string
          handover_person_name: string | null
          handover_person_signature: string | null
          handover_timestamp: string | null
          id: string
          jobcard_id: string | null
          notes: string | null
          pcs_in: number | null
          pcs_out: number | null
          stage_name: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          weight_in: number | null
          weight_out: number | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          department: string
          handover_person_name?: string | null
          handover_person_signature?: string | null
          handover_timestamp?: string | null
          id?: string
          jobcard_id?: string | null
          notes?: string | null
          pcs_in?: number | null
          pcs_out?: number | null
          stage_name: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          weight_in?: number | null
          weight_out?: number | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          department?: string
          handover_person_name?: string | null
          handover_person_signature?: string | null
          handover_timestamp?: string | null
          id?: string
          jobcard_id?: string | null
          notes?: string | null
          pcs_in?: number | null
          pcs_out?: number | null
          stage_name?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          weight_in?: number | null
          weight_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_tracking_jobcard_id_fkey"
            columns: ["jobcard_id"]
            isOneToOne: false
            referencedRelation: "jobcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "sales"
        | "production_manager"
        | "designer"
        | "workshop"
        | "design"
      inquiry_status:
        | "pending"
        | "in_review"
        | "continued"
        | "cancelled"
        | "in_design"
        | "production_ready"
        | "in_production"
        | "completed"
      product_category:
        | "kundan"
        | "diamond"
        | "gold"
        | "silver"
        | "platinum"
        | "custom"
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
    Enums: {
      app_role: [
        "admin",
        "sales",
        "production_manager",
        "designer",
        "workshop",
        "design",
      ],
      inquiry_status: [
        "pending",
        "in_review",
        "continued",
        "cancelled",
        "in_design",
        "production_ready",
        "in_production",
        "completed",
      ],
      product_category: [
        "kundan",
        "diamond",
        "gold",
        "silver",
        "platinum",
        "custom",
      ],
    },
  },
} as const
