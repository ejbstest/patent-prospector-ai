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
      admin_reviews: {
        Row: {
          analysis_id: string
          changes_made: Json | null
          created_at: string
          expert_user_id: string | null
          id: string
          notes: string | null
          review_stage: string
          time_spent_minutes: number | null
        }
        Insert: {
          analysis_id: string
          changes_made?: Json | null
          created_at?: string
          expert_user_id?: string | null
          id?: string
          notes?: string | null
          review_stage: string
          time_spent_minutes?: number | null
        }
        Update: {
          analysis_id?: string
          changes_made?: Json | null
          created_at?: string
          expert_user_id?: string | null
          id?: string
          notes?: string | null
          review_stage?: string
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_reviews_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_reviews_expert_user_id_fkey"
            columns: ["expert_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_logs: {
        Row: {
          agent_input: Json | null
          agent_name: Database["public"]["Enums"]["agent_name"]
          agent_output: Json | null
          analysis_id: string
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          status: Database["public"]["Enums"]["agent_status"]
        }
        Insert: {
          agent_input?: Json | null
          agent_name: Database["public"]["Enums"]["agent_name"]
          agent_output?: Json | null
          analysis_id: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          status: Database["public"]["Enums"]["agent_status"]
        }
        Update: {
          agent_input?: Json | null
          agent_name?: Database["public"]["Enums"]["agent_name"]
          agent_output?: Json | null
          analysis_id?: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          status?: Database["public"]["Enums"]["agent_status"]
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          amount_paid: number | null
          analysis_type: Database["public"]["Enums"]["analysis_type"]
          cpc_classifications: string[] | null
          created_at: string
          id: string
          invention_description: string
          invention_title: string
          jurisdictions: string[] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          progress_percentage: number | null
          report_generated_at: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_score: number | null
          status: Database["public"]["Enums"]["analysis_status"]
          technical_keywords: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          analysis_type?: Database["public"]["Enums"]["analysis_type"]
          cpc_classifications?: string[] | null
          created_at?: string
          id?: string
          invention_description: string
          invention_title: string
          jurisdictions?: string[] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          progress_percentage?: number | null
          report_generated_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["analysis_status"]
          technical_keywords?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          analysis_type?: Database["public"]["Enums"]["analysis_type"]
          cpc_classifications?: string[] | null
          created_at?: string
          id?: string
          invention_description?: string
          invention_title?: string
          jurisdictions?: string[] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          progress_percentage?: number | null
          report_generated_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["analysis_status"]
          technical_keywords?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_drafts: {
        Row: {
          created_at: string
          current_step: number
          draft_name: string
          form_data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          draft_name: string
          form_data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          draft_name?: string
          form_data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patent_conflicts: {
        Row: {
          analysis_id: string
          assignee: string | null
          claim_overlap_percentage: number | null
          conflict_description: string | null
          conflict_severity: number | null
          created_at: string
          design_around_suggestions: string | null
          filing_date: string | null
          id: string
          legal_status: string | null
          patent_number: string
          patent_title: string
          relevant_claims: string[] | null
        }
        Insert: {
          analysis_id: string
          assignee?: string | null
          claim_overlap_percentage?: number | null
          conflict_description?: string | null
          conflict_severity?: number | null
          created_at?: string
          design_around_suggestions?: string | null
          filing_date?: string | null
          id?: string
          legal_status?: string | null
          patent_number: string
          patent_title: string
          relevant_claims?: string[] | null
        }
        Update: {
          analysis_id?: string
          assignee?: string | null
          claim_overlap_percentage?: number | null
          conflict_description?: string | null
          conflict_severity?: number | null
          created_at?: string
          design_around_suggestions?: string | null
          filing_date?: string | null
          id?: string
          legal_status?: string | null
          patent_number?: string
          patent_title?: string
          relevant_claims?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_conflicts_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          analysis_id: string | null
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          analysis_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          analysis_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preview_reports: {
        Row: {
          analysis_id: string
          confidence_level: number | null
          created_at: string
          generated_at: string
          id: string
          key_findings: string[] | null
          landscape_summary: Json | null
          patents_found_count: number | null
          preliminary_risk_score: number | null
          risk_level: string | null
          top_conflicts: Json | null
        }
        Insert: {
          analysis_id: string
          confidence_level?: number | null
          created_at?: string
          generated_at?: string
          id?: string
          key_findings?: string[] | null
          landscape_summary?: Json | null
          patents_found_count?: number | null
          preliminary_risk_score?: number | null
          risk_level?: string | null
          top_conflicts?: Json | null
        }
        Update: {
          analysis_id?: string
          confidence_level?: number | null
          created_at?: string
          generated_at?: string
          id?: string
          key_findings?: string[] | null
          landscape_summary?: Json | null
          patents_found_count?: number | null
          preliminary_risk_score?: number | null
          risk_level?: string | null
          top_conflicts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "preview_reports_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          credit_amount: number | null
          id: string
          referred_email: string
          referred_user_id: string | null
          referrer_user_id: string
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          created_at?: string
          credit_amount?: number | null
          id?: string
          referred_email: string
          referred_user_id?: string | null
          referrer_user_id: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          created_at?: string
          credit_amount?: number | null
          id?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          analysis_id: string
          created_at: string
          detailed_analysis: Json | null
          executive_summary: string | null
          generated_by: string
          id: string
          pdf_path: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          version: number
        }
        Insert: {
          analysis_id: string
          created_at?: string
          detailed_analysis?: Json | null
          executive_summary?: string | null
          generated_by: string
          id?: string
          pdf_path?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          version?: number
        }
        Update: {
          analysis_id?: string
          created_at?: string
          detailed_analysis?: Json | null
          executive_summary?: string | null
          generated_by?: string
          id?: string
          pdf_path?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reports_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_name: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_name: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_name?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_documents: {
        Row: {
          analysis_id: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          uploaded_at: string
        }
        Insert: {
          analysis_id: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          uploaded_at?: string
        }
        Update: {
          analysis_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_documents_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      agent_name: "research" | "analysis" | "legal" | "report" | "qa"
      agent_status: "success" | "failed"
      analysis_status:
        | "intake"
        | "searching"
        | "analyzing"
        | "reviewing"
        | "complete"
        | "failed"
        | "preview_ready"
      analysis_type: "standard" | "premium_whitespace"
      app_role: "admin" | "expert" | "user"
      payment_status: "unpaid" | "paid" | "free_trial"
      referral_status: "pending" | "completed" | "credited"
      report_type: "snapshot" | "full" | "premium"
      risk_level: "low" | "medium" | "high" | "critical"
      subscription_status: "active" | "canceled" | "past_due"
      subscription_tier: "free" | "standard" | "premium" | "enterprise"
      transaction_status: "succeeded" | "failed" | "pending"
      user_type: "novice" | "intermediate" | "expert"
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
      agent_name: ["research", "analysis", "legal", "report", "qa"],
      agent_status: ["success", "failed"],
      analysis_status: [
        "intake",
        "searching",
        "analyzing",
        "reviewing",
        "complete",
        "failed",
        "preview_ready",
      ],
      analysis_type: ["standard", "premium_whitespace"],
      app_role: ["admin", "expert", "user"],
      payment_status: ["unpaid", "paid", "free_trial"],
      referral_status: ["pending", "completed", "credited"],
      report_type: ["snapshot", "full", "premium"],
      risk_level: ["low", "medium", "high", "critical"],
      subscription_status: ["active", "canceled", "past_due"],
      subscription_tier: ["free", "standard", "premium", "enterprise"],
      transaction_status: ["succeeded", "failed", "pending"],
      user_type: ["novice", "intermediate", "expert"],
    },
  },
} as const
