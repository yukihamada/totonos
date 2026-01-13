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
      boost_requests: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          created_at: string
          fee_amount: number
          fee_percentage: number
          id: string
          invoice_id: string
          net_amount: number
          requested_amount: number
          requested_at: string
          status: Database["public"]["Enums"]["boost_status"]
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          fee_amount: number
          fee_percentage: number
          id?: string
          invoice_id: string
          net_amount: number
          requested_amount: number
          requested_at?: string
          status?: Database["public"]["Enums"]["boost_status"]
          user_id: string
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          fee_amount?: number
          fee_percentage?: number
          id?: string
          invoice_id?: string
          net_amount?: number
          requested_amount?: number
          requested_at?: string
          status?: Database["public"]["Enums"]["boost_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contract_items: {
        Row: {
          content: string
          contract_id: string
          created_at: string
          id: string
          item_order: number
          title: string
        }
        Insert: {
          content: string
          contract_id: string
          created_at?: string
          id?: string
          item_order?: number
          title: string
        }
        Update: {
          content?: string
          contract_id?: string
          created_at?: string
          id?: string
          item_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          blockchain_block_number: number | null
          blockchain_network: string | null
          blockchain_tx_hash: string | null
          blockchain_verified_at: string | null
          content_hash: string | null
          contract_id: string
          created_at: string
          id: string
          otp_code: string | null
          otp_expires_at: string | null
          signatory_email: string
          signatory_name: string | null
          signatory_type: Database["public"]["Enums"]["signatory_type"]
          signature_method: Database["public"]["Enums"]["signature_method"]
          signature_token: string | null
          signed_at: string | null
          signed_ip: string | null
          signed_user_agent: string | null
          updated_at: string
        }
        Insert: {
          blockchain_block_number?: number | null
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          blockchain_verified_at?: string | null
          content_hash?: string | null
          contract_id: string
          created_at?: string
          id?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          signatory_email: string
          signatory_name?: string | null
          signatory_type: Database["public"]["Enums"]["signatory_type"]
          signature_method?: Database["public"]["Enums"]["signature_method"]
          signature_token?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          signed_user_agent?: string | null
          updated_at?: string
        }
        Update: {
          blockchain_block_number?: number | null
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          blockchain_verified_at?: string | null
          content_hash?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          otp_code?: string | null
          otp_expires_at?: string | null
          signatory_email?: string
          signatory_name?: string | null
          signatory_type?: Database["public"]["Enums"]["signatory_type"]
          signature_method?: Database["public"]["Enums"]["signature_method"]
          signature_token?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          signed_user_agent?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          amount: number
          client_id: string | null
          content: string | null
          content_hash: string | null
          contract_number: string
          created_at: string
          id: string
          issue_date: string
          status: Database["public"]["Enums"]["contract_status"]
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          content?: string | null
          content_hash?: string | null
          contract_number: string
          created_at?: string
          id?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tax_amount?: number | null
          title: string
          total_amount?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          content?: string | null
          content_hash?: string | null
          contract_number?: string
          created_at?: string
          id?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          estimate_id: string
          id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          estimate_id?: string
          id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          accepted_at: string | null
          amount: number
          client_id: string | null
          created_at: string
          description: string | null
          estimate_number: string
          id: string
          issue_date: string
          status: Database["public"]["Enums"]["estimate_status"]
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string
        }
        Insert: {
          accepted_at?: string | null
          amount: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          estimate_number: string
          id?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["estimate_status"]
          tax_amount?: number | null
          title: string
          total_amount: number
          updated_at?: string
          user_id: string
          valid_until: string
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          estimate_number?: string
          id?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["estimate_status"]
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          paid_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          virtual_account_number: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_amount?: number | null
          title: string
          total_amount: number
          updated_at?: string
          user_id: string
          virtual_account_number?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          virtual_account_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          is_reconciled: boolean | null
          payer_name: string | null
          payment_date: string
          reconciled_at: string | null
          user_id: string
          virtual_account_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          is_reconciled?: boolean | null
          payer_name?: string | null
          payment_date?: string
          reconciled_at?: string | null
          user_id: string
          virtual_account_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          is_reconciled?: boolean | null
          payer_name?: string | null
          payment_date?: string
          reconciled_at?: string | null
          user_id?: string
          virtual_account_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_address: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          purchase_order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          purchase_order_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          purchase_order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          amount: number
          client_id: string | null
          confirmed_at: string | null
          created_at: string
          delivery_date: string | null
          description: string | null
          id: string
          issue_date: string
          order_number: string
          status: Database["public"]["Enums"]["purchase_order_status"]
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          issue_date?: string
          order_number: string
          status?: Database["public"]["Enums"]["purchase_order_status"]
          tax_amount?: number | null
          title: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          issue_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["purchase_order_status"]
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_verification_logs: {
        Row: {
          blockchain_confirmed: boolean | null
          contract_id: string
          details: Json | null
          id: string
          verification_result: boolean
          verified_at: string
          verified_by_ip: string | null
        }
        Insert: {
          blockchain_confirmed?: boolean | null
          contract_id: string
          details?: Json | null
          id?: string
          verification_result: boolean
          verified_at?: string
          verified_by_ip?: string | null
        }
        Update: {
          blockchain_confirmed?: boolean | null
          contract_id?: string
          details?: Json | null
          id?: string
          verification_result?: boolean
          verified_at?: string
          verified_by_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_verification_logs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_passports: {
        Row: {
          account_age_months: number | null
          average_payment_days: number | null
          boost_completion_rate: number | null
          boost_count: number | null
          boost_usage_score: number
          client_diversity_score: number | null
          created_at: string
          delay_free_months: number | null
          id: string
          last_calculated_at: string
          monthly_invoice_amount: number | null
          on_time_payment_rate: number | null
          payment_accuracy_score: number
          rank: Database["public"]["Enums"]["trust_rank"]
          score: number
          transaction_volume_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_age_months?: number | null
          average_payment_days?: number | null
          boost_completion_rate?: number | null
          boost_count?: number | null
          boost_usage_score?: number
          client_diversity_score?: number | null
          created_at?: string
          delay_free_months?: number | null
          id?: string
          last_calculated_at?: string
          monthly_invoice_amount?: number | null
          on_time_payment_rate?: number | null
          payment_accuracy_score?: number
          rank?: Database["public"]["Enums"]["trust_rank"]
          score?: number
          transaction_volume_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_age_months?: number | null
          average_payment_days?: number | null
          boost_completion_rate?: number | null
          boost_count?: number | null
          boost_usage_score?: number
          client_diversity_score?: number | null
          created_at?: string
          delay_free_months?: number | null
          id?: string
          last_calculated_at?: string
          monthly_invoice_amount?: number | null
          on_time_payment_rate?: number | null
          payment_accuracy_score?: number
          rank?: Database["public"]["Enums"]["trust_rank"]
          score?: number
          transaction_volume_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trust_score_history: {
        Row: {
          created_at: string
          event_type: string
          id: string
          rank: Database["public"]["Enums"]["trust_rank"]
          score: number
          score_change: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          rank: Database["public"]["Enums"]["trust_rank"]
          score: number
          score_change?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          rank?: Database["public"]["Enums"]["trust_rank"]
          score?: number
          score_change?: number | null
          user_id?: string
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
      boost_status: "pending" | "approved" | "completed" | "rejected"
      contract_status:
        | "draft"
        | "sent"
        | "pending_signature"
        | "partially_signed"
        | "signed"
        | "expired"
        | "cancelled"
      estimate_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      invoice_status:
        | "draft"
        | "sent"
        | "pending"
        | "paid"
        | "overdue"
        | "cancelled"
      purchase_order_status:
        | "draft"
        | "sent"
        | "confirmed"
        | "delivered"
        | "cancelled"
      signatory_type: "issuer" | "recipient"
      signature_method: "email_otp" | "wallet"
      trust_rank: "S" | "A" | "B" | "C" | "D"
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
      boost_status: ["pending", "approved", "completed", "rejected"],
      contract_status: [
        "draft",
        "sent",
        "pending_signature",
        "partially_signed",
        "signed",
        "expired",
        "cancelled",
      ],
      estimate_status: ["draft", "sent", "accepted", "rejected", "expired"],
      invoice_status: [
        "draft",
        "sent",
        "pending",
        "paid",
        "overdue",
        "cancelled",
      ],
      purchase_order_status: [
        "draft",
        "sent",
        "confirmed",
        "delivered",
        "cancelled",
      ],
      signatory_type: ["issuer", "recipient"],
      signature_method: ["email_otp", "wallet"],
      trust_rank: ["S", "A", "B", "C", "D"],
    },
  },
} as const
