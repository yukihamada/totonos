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
      accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          parent_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          parent_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          parent_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_date: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          client_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          next_action: string | null
          next_action_date: string | null
          subject: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          subject: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          key_hash: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          key_hash: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          key_hash?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          request_count: number | null
          scopes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          request_count?: number | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          request_count?: number | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          updated_at?: string
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          updated_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          break_end: string | null
          break_start: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string
          employee_id: string
          id: string
          note: string | null
          overtime_hours: number | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          work_date: string
          work_hours: number | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          note?: string | null
          overtime_hours?: number | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date: string
          work_hours?: number | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          note?: string | null
          overtime_hours?: number | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
        ]
      }
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
      companies: {
        Row: {
          address: string | null
          created_at: string
          created_by: string
          display_name: string | null
          email: string | null
          employee_count: string | null
          fiscal_year_start_month: number | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by: string
          display_name?: string | null
          email?: string | null
          employee_count?: string | null
          fiscal_year_start_month?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string
          display_name?: string | null
          email?: string | null
          employee_count?: string | null
          fiscal_year_start_month?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_credits: {
        Row: {
          charged_credits: number
          company_id: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          monthly_credits: number
          plan: string
          updated_at: string
          used_this_month: number
        }
        Insert: {
          charged_credits?: number
          company_id: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          monthly_credits?: number
          plan?: string
          updated_at?: string
          used_this_month?: number
        }
        Update: {
          charged_credits?: number
          company_id?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          monthly_credits?: number
          plan?: string
          updated_at?: string
          used_this_month?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_credits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_email_addresses: {
        Row: {
          address_prefix: string
          ai_processing_enabled: boolean
          assigned_to: string | null
          auto_create_entity: boolean
          company_id: string
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          notify_mode: string | null
          purpose: Database["public"]["Enums"]["email_purpose"]
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          address_prefix: string
          ai_processing_enabled?: boolean
          assigned_to?: string | null
          auto_create_entity?: boolean
          company_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          notify_mode?: string | null
          purpose?: Database["public"]["Enums"]["email_purpose"]
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          address_prefix?: string
          ai_processing_enabled?: boolean
          assigned_to?: string | null
          auto_create_entity?: boolean
          company_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          notify_mode?: string | null
          purpose?: Database["public"]["Enums"]["email_purpose"]
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_email_addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_email_settings: {
        Row: {
          alert_keywords: string[] | null
          auto_reply_enabled: boolean | null
          company_id: string
          created_at: string | null
          id: string
          notification_slack_webhook: string | null
          updated_at: string | null
          vip_email_addresses: string[] | null
          vip_email_domains: string[] | null
        }
        Insert: {
          alert_keywords?: string[] | null
          auto_reply_enabled?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          notification_slack_webhook?: string | null
          updated_at?: string | null
          vip_email_addresses?: string[] | null
          vip_email_domains?: string[] | null
        }
        Update: {
          alert_keywords?: string[] | null
          auto_reply_enabled?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          notification_slack_webhook?: string | null
          updated_at?: string | null
          vip_email_addresses?: string[] | null
          vip_email_domains?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "company_email_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          permissions: Database["public"]["Enums"]["permission_type"][] | null
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          permissions?: Database["public"]["Enums"]["permission_type"][] | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          permissions?: Database["public"]["Enums"]["permission_type"][] | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          is_active: boolean
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      credit_transactions: {
        Row: {
          action: string | null
          amount: number
          balance_after: number
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          amount: number
          balance_after: number
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          amount?: number
          balance_after?: number
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_audit_log: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          operation: string
          query_details: Json | null
          record_count: number | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          operation: string
          query_details?: Json | null
          record_count?: number | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          operation?: string
          query_details?: Json | null
          record_count?: number | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          actual_close_date: string | null
          amount: number | null
          assigned_to: string | null
          client_id: string | null
          contract_id: string | null
          created_at: string
          deal_name: string
          estimate_id: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          probability: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_close_date?: string | null
          amount?: number | null
          assigned_to?: string | null
          client_id?: string | null
          contract_id?: string | null
          created_at?: string
          deal_name: string
          estimate_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_close_date?: string | null
          amount?: number | null
          assigned_to?: string | null
          client_id?: string | null
          contract_id?: string | null
          created_at?: string
          deal_name?: string
          estimate_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      depreciation_schedules: {
        Row: {
          accumulated_depreciation: number
          book_value_after: number
          created_at: string
          depreciation_amount: number
          depreciation_date: string
          fiscal_period_id: string | null
          fixed_asset_id: string
          id: string
          journal_entry_id: string | null
        }
        Insert: {
          accumulated_depreciation: number
          book_value_after: number
          created_at?: string
          depreciation_amount: number
          depreciation_date: string
          fiscal_period_id?: string | null
          fixed_asset_id: string
          id?: string
          journal_entry_id?: string | null
        }
        Update: {
          accumulated_depreciation?: number
          book_value_after?: number
          created_at?: string
          depreciation_amount?: number
          depreciation_date?: string
          fiscal_period_id?: string | null
          fixed_asset_id?: string
          id?: string
          journal_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_schedules_fiscal_period_id_fkey"
            columns: ["fiscal_period_id"]
            isOneToOne: false
            referencedRelation: "fiscal_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciation_schedules_fixed_asset_id_fkey"
            columns: ["fixed_asset_id"]
            isOneToOne: false
            referencedRelation: "fixed_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciation_schedules_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          invoice_id: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sensitive_data: {
        Row: {
          bank_account_number: string | null
          bank_account_type: string | null
          bank_branch: string | null
          bank_name: string | null
          base_salary: number | null
          birth_date: string | null
          created_at: string
          employee_id: string
          id: string
          social_insurance_number: string | null
          updated_at: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          base_salary?: number | null
          birth_date?: string | null
          created_at?: string
          employee_id: string
          id?: string
          social_insurance_number?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          base_salary?: number | null
          birth_date?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          social_insurance_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_sensitive_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_sensitive_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_sensitive_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account_number: string | null
          bank_account_type: string | null
          bank_branch: string | null
          bank_name: string | null
          base_salary: number | null
          birth_date: string | null
          company_id: string | null
          created_at: string
          department: string | null
          email: string | null
          employee_number: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          hire_date: string
          id: string
          name: string
          name_kana: string | null
          phone: string | null
          position: string | null
          resignation_date: string | null
          social_insurance_number: string | null
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          base_salary?: number | null
          birth_date?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_number: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          hire_date: string
          id?: string
          name: string
          name_kana?: string | null
          phone?: string | null
          position?: string | null
          resignation_date?: string | null
          social_insurance_number?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          base_salary?: number | null
          birth_date?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_number?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          hire_date?: string
          id?: string
          name?: string
          name_kana?: string | null
          phone?: string | null
          position?: string | null
          resignation_date?: string | null
          social_insurance_number?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      expense_claims: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          claim_date: string
          claim_number: string
          claimant_name: string | null
          created_at: string
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["expense_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          claim_date?: string
          claim_number: string
          claimant_name?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          claim_date?: string
          claim_number?: string
          claimant_name?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_items: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          description: string
          expense_claim_id: string
          expense_date: string
          id: string
          receipt_url: string | null
          vendor_name: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          description: string
          expense_claim_id: string
          expense_date: string
          id?: string
          receipt_url?: string | null
          vendor_name?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          description?: string
          expense_claim_id?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_items_expense_claim_id_fkey"
            columns: ["expense_claim_id"]
            isOneToOne: false
            referencedRelation: "expense_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      external_connections: {
        Row: {
          company_id: string | null
          created_at: string | null
          credentials: Json | null
          display_name: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          service_type: string
          settings: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          credentials?: Json | null
          display_name?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          service_type: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          credentials?: Json | null
          display_name?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          service_type?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_connections_service_type_fkey"
            columns: ["service_type"]
            isOneToOne: false
            referencedRelation: "external_service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      external_service_types: {
        Row: {
          auth_type: string
          category: string
          config: Json | null
          created_at: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          auth_type?: string
          category: string
          config?: Json | null
          created_at?: string | null
          icon_name?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          auth_type?: string
          category?: string
          config?: Json | null
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      fiscal_periods: {
        Row: {
          closed_at: string | null
          created_at: string
          end_date: string
          id: string
          is_closed: boolean | null
          period_name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_closed?: boolean | null
          period_name: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_closed?: boolean | null
          period_name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fixed_assets: {
        Row: {
          acquisition_cost: number
          acquisition_date: string
          asset_category: Database["public"]["Enums"]["asset_category"]
          asset_code: string
          asset_name: string
          created_at: string
          current_book_value: number
          depreciation_method: Database["public"]["Enums"]["depreciation_method"]
          disposal_amount: number | null
          disposal_date: string | null
          id: string
          is_active: boolean | null
          salvage_value: number | null
          updated_at: string
          useful_life_years: number
          user_id: string
        }
        Insert: {
          acquisition_cost: number
          acquisition_date: string
          asset_category: Database["public"]["Enums"]["asset_category"]
          asset_code: string
          asset_name: string
          created_at?: string
          current_book_value: number
          depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          disposal_amount?: number | null
          disposal_date?: string | null
          id?: string
          is_active?: boolean | null
          salvage_value?: number | null
          updated_at?: string
          useful_life_years: number
          user_id: string
        }
        Update: {
          acquisition_cost?: number
          acquisition_date?: string
          asset_category?: Database["public"]["Enums"]["asset_category"]
          asset_code?: string
          asset_name?: string
          created_at?: string
          current_book_value?: number
          depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          disposal_amount?: number | null
          disposal_date?: string | null
          id?: string
          is_active?: boolean | null
          salvage_value?: number | null
          updated_at?: string
          useful_life_years?: number
          user_id?: string
        }
        Relationships: []
      }
      import_errors: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          job_id: string
          original_data: Json | null
          row_number: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          original_data?: Json | null
          row_number?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          original_data?: Json | null
          row_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_rows: number | null
          error_summary: Json | null
          file_name: string | null
          id: string
          mapping_config: Json | null
          processed_rows: number | null
          source_service: string
          started_at: string | null
          status: string | null
          target_module: string
          total_rows: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_rows?: number | null
          error_summary?: Json | null
          file_name?: string | null
          id?: string
          mapping_config?: Json | null
          processed_rows?: number | null
          source_service: string
          started_at?: string | null
          status?: string | null
          target_module: string
          total_rows?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_rows?: number | null
          error_summary?: Json | null
          file_name?: string | null
          id?: string
          mapping_config?: Json | null
          processed_rows?: number | null
          source_service?: string
          started_at?: string | null
          status?: string | null
          target_module?: string
          total_rows?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      import_templates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          mapping: Json
          source_service: string
          target_module: string
          template_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          mapping: Json
          source_service: string
          target_module: string
          template_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          mapping?: Json
          source_service?: string
          target_module?: string
          template_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inbound_emails: {
        Row: {
          ai_category: string | null
          ai_command_executed_at: string | null
          ai_command_response: string | null
          ai_extracted_deadline: string | null
          ai_sentiment: string | null
          ai_summary: string | null
          ai_urgency: string | null
          assigned_to: string | null
          attachments: Json | null
          auto_created_entity_id: string | null
          auto_created_entity_type: string | null
          cc_emails: string[] | null
          company_id: string | null
          created_at: string
          email_address_id: string | null
          from_email: string
          from_name: string | null
          headers: Json | null
          html_body: string | null
          id: string
          is_archived: boolean
          is_read: boolean
          is_spam: boolean
          is_starred: boolean
          message_id: string | null
          raw_payload: Json | null
          related_id: string | null
          related_type: string | null
          reply_to: string | null
          status: string
          subject: string | null
          tags: string[] | null
          text_body: string | null
          to_email: string
          updated_at: string
        }
        Insert: {
          ai_category?: string | null
          ai_command_executed_at?: string | null
          ai_command_response?: string | null
          ai_extracted_deadline?: string | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          ai_urgency?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          auto_created_entity_id?: string | null
          auto_created_entity_type?: string | null
          cc_emails?: string[] | null
          company_id?: string | null
          created_at?: string
          email_address_id?: string | null
          from_email: string
          from_name?: string | null
          headers?: Json | null
          html_body?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          is_spam?: boolean
          is_starred?: boolean
          message_id?: string | null
          raw_payload?: Json | null
          related_id?: string | null
          related_type?: string | null
          reply_to?: string | null
          status?: string
          subject?: string | null
          tags?: string[] | null
          text_body?: string | null
          to_email: string
          updated_at?: string
        }
        Update: {
          ai_category?: string | null
          ai_command_executed_at?: string | null
          ai_command_response?: string | null
          ai_extracted_deadline?: string | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          ai_urgency?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          auto_created_entity_id?: string | null
          auto_created_entity_type?: string | null
          cc_emails?: string[] | null
          company_id?: string | null
          created_at?: string
          email_address_id?: string | null
          from_email?: string
          from_name?: string | null
          headers?: Json | null
          html_body?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          is_spam?: boolean
          is_starred?: boolean
          message_id?: string | null
          raw_payload?: Json | null
          related_id?: string | null
          related_type?: string | null
          reply_to?: string | null
          status?: string
          subject?: string | null
          tags?: string[] | null
          text_body?: string | null
          to_email?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbound_emails_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbound_emails_email_address_id_fkey"
            columns: ["email_address_id"]
            isOneToOne: false
            referencedRelation: "company_email_addresses"
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
      it_assets: {
        Row: {
          asset_code: string
          asset_name: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          assigned_to_employee_id: string | null
          created_at: string
          id: string
          license_expires_at: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_code: string
          asset_name: string
          asset_type?: Database["public"]["Enums"]["asset_type"]
          assigned_to_employee_id?: string | null
          created_at?: string
          id?: string
          license_expires_at?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_code?: string
          asset_name?: string
          asset_type?: Database["public"]["Enums"]["asset_type"]
          assigned_to_employee_id?: string | null
          created_at?: string
          id?: string
          license_expires_at?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "it_assets_assigned_to_employee_id_fkey"
            columns: ["assigned_to_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "it_assets_assigned_to_employee_id_fkey"
            columns: ["assigned_to_employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "it_assets_assigned_to_employee_id_fkey"
            columns: ["assigned_to_employee_id"]
            isOneToOne: false
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          description: string | null
          entry_date: string
          entry_number: string
          fiscal_period_id: string | null
          id: string
          is_posted: boolean | null
          source_id: string | null
          source_type: Database["public"]["Enums"]["journal_source_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_date: string
          entry_number: string
          fiscal_period_id?: string | null
          id?: string
          is_posted?: boolean | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["journal_source_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_number?: string
          fiscal_period_id?: string | null
          id?: string
          is_posted?: boolean | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["journal_source_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_fiscal_period_id_fkey"
            columns: ["fiscal_period_id"]
            isOneToOne: false
            referencedRelation: "fiscal_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_name: string
          contact_name: string | null
          converted_to_client_id: string | null
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          source: Database["public"]["Enums"]["lead_source"] | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          company_name: string
          contact_name?: string | null
          converted_to_client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          company_name?: string
          contact_name?: string | null
          converted_to_client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_to_client_id_fkey"
            columns: ["converted_to_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      line_chat_history: {
        Row: {
          content: string
          created_at: string
          has_attachment: boolean | null
          id: string
          line_user_id: string
          message_id: string | null
          message_type: string | null
          reply_token: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          has_attachment?: boolean | null
          id?: string
          line_user_id: string
          message_id?: string | null
          message_type?: string | null
          reply_token?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          has_attachment?: boolean | null
          id?: string
          line_user_id?: string
          message_id?: string | null
          message_type?: string | null
          reply_token?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      line_users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          line_user_id: string
          linked_at: string | null
          picture_url: string | null
          status_message: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          line_user_id: string
          linked_at?: string | null
          picture_url?: string | null
          status_message?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          line_user_id?: string
          linked_at?: string | null
          picture_url?: string | null
          status_message?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          member_id: string
          permission: Database["public"]["Enums"]["permission_type"]
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          member_id: string
          permission: Database["public"]["Enums"]["permission_type"]
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          member_id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
        }
        Relationships: [
          {
            foreignKeyName: "member_permissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
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
      paid_leave_balances: {
        Row: {
          created_at: string
          employee_id: string
          expires_at: string | null
          fiscal_year: number
          granted_days: number
          id: string
          remaining_days: number
          used_days: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          expires_at?: string | null
          fiscal_year: number
          granted_days?: number
          id?: string
          remaining_days?: number
          used_days?: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          expires_at?: string | null
          fiscal_year?: number
          granted_days?: number
          id?: string
          remaining_days?: number
          used_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "paid_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paid_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paid_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
        ]
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
      payroll_records: {
        Row: {
          allowances: Json | null
          base_salary: number
          created_at: string
          deductions: Json | null
          employee_id: string
          gross_pay: number
          id: string
          journal_entry_id: string | null
          net_pay: number
          overtime_pay: number | null
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          status: Database["public"]["Enums"]["payroll_status"]
          updated_at: string
        }
        Insert: {
          allowances?: Json | null
          base_salary?: number
          created_at?: string
          deductions?: Json | null
          employee_id: string
          gross_pay?: number
          id?: string
          journal_entry_id?: string | null
          net_pay?: number
          overtime_pay?: number | null
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
        }
        Update: {
          allowances?: Json | null
          base_salary?: number
          created_at?: string
          deductions?: Json | null
          employee_id?: string
          gross_pay?: number
          id?: string
          journal_entry_id?: string | null
          net_pay?: number
          overtime_pay?: number | null
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
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
      receipts: {
        Row: {
          category: string | null
          company_id: string | null
          confidence: number | null
          created_at: string | null
          expense_claim_id: string | null
          id: string
          image_url: string | null
          items: Json | null
          legal_hash: string | null
          legal_timestamp: string | null
          legal_verified: boolean | null
          notification_sent_at: string | null
          raw_text: string | null
          receipt_date: string | null
          retention_until: string | null
          source: string
          source_email_id: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          confidence?: number | null
          created_at?: string | null
          expense_claim_id?: string | null
          id?: string
          image_url?: string | null
          items?: Json | null
          legal_hash?: string | null
          legal_timestamp?: string | null
          legal_verified?: boolean | null
          notification_sent_at?: string | null
          raw_text?: string | null
          receipt_date?: string | null
          retention_until?: string | null
          source: string
          source_email_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          confidence?: number | null
          created_at?: string | null
          expense_claim_id?: string | null
          id?: string
          image_url?: string | null
          items?: Json | null
          legal_hash?: string | null
          legal_timestamp?: string | null
          legal_verified?: boolean | null
          notification_sent_at?: string | null
          raw_text?: string | null
          receipt_date?: string | null
          retention_until?: string | null
          source?: string
          source_email_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_expense_claim_id_fkey"
            columns: ["expense_claim_id"]
            isOneToOne: false
            referencedRelation: "expense_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_source_email_id_fkey"
            columns: ["source_email_id"]
            isOneToOne: false
            referencedRelation: "inbound_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_targets: {
        Row: {
          achieved_amount: number | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["target_period_type"]
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_amount?: number | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type?: Database["public"]["Enums"]["target_period_type"]
          target_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_amount?: number | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["target_period_type"]
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sensitive_data_audit_log: {
        Row: {
          accessed_at: string
          action: string
          company_id: string | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string
          action: string
          company_id?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string
          action?: string
          company_id?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_data_audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_name: string | null
          related_id: string | null
          related_type: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_name?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_name?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_settings: {
        Row: {
          consumption_tax_rate: number
          corporate_tax_rate: number | null
          created_at: string
          fiscal_year_start_month: number
          id: string
          is_simplified_taxation: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consumption_tax_rate?: number
          corporate_tax_rate?: number | null
          created_at?: string
          fiscal_year_start_month?: number
          id?: string
          is_simplified_taxation?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consumption_tax_rate?: number
          corporate_tax_rate?: number | null
          created_at?: string
          fiscal_year_start_month?: number
          id?: string
          is_simplified_taxation?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_ai_settings: {
        Row: {
          created_at: string | null
          custom_api_key: string | null
          id: string
          model: string
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_api_key?: string | null
          id?: string
          model?: string
          provider?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_api_key?: string | null
          id?: string
          model?: string
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          charged_credits: number
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          monthly_credits: number
          plan: string
          updated_at: string
          used_this_month: number
          user_id: string
        }
        Insert: {
          charged_credits?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          monthly_credits?: number
          plan?: string
          updated_at?: string
          used_this_month?: number
          user_id: string
        }
        Update: {
          charged_credits?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          monthly_credits?: number
          plan?: string
          updated_at?: string
          used_this_month?: number
          user_id?: string
        }
        Relationships: []
      }
      user_current_company: {
        Row: {
          company_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_current_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_pages: {
        Row: {
          category: Database["public"]["Enums"]["wiki_category"] | null
          content: string | null
          created_at: string
          id: string
          is_published: boolean | null
          last_edited_by: string | null
          parent_page_id: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["wiki_category"] | null
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          last_edited_by?: string | null
          parent_page_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["wiki_category"] | null
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          last_edited_by?: string | null
          parent_page_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      year_end_adjustments: {
        Row: {
          adjustment_amount: number | null
          calculated_tax: number | null
          created_at: string
          dependent_count: number | null
          earthquake_insurance_deduction: number | null
          employee_id: string
          housing_loan_deduction: number | null
          id: string
          life_insurance_deduction: number | null
          spouse_deduction: number | null
          status: Database["public"]["Enums"]["year_end_status"]
          tax_year: number
          updated_at: string
        }
        Insert: {
          adjustment_amount?: number | null
          calculated_tax?: number | null
          created_at?: string
          dependent_count?: number | null
          earthquake_insurance_deduction?: number | null
          employee_id: string
          housing_loan_deduction?: number | null
          id?: string
          life_insurance_deduction?: number | null
          spouse_deduction?: number | null
          status?: Database["public"]["Enums"]["year_end_status"]
          tax_year: number
          updated_at?: string
        }
        Update: {
          adjustment_amount?: number | null
          calculated_tax?: number | null
          created_at?: string
          dependent_count?: number | null
          earthquake_insurance_deduction?: number | null
          employee_id?: string
          housing_loan_deduction?: number | null
          id?: string
          life_insurance_deduction?: number | null
          spouse_deduction?: number | null
          status?: Database["public"]["Enums"]["year_end_status"]
          tax_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "year_end_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "year_end_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "year_end_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      api_keys_safe: {
        Row: {
          created_at: string | null
          id: string | null
          key_prefix: string | null
          last_used_at: string | null
          name: string | null
          request_count: number | null
          scopes: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          key_prefix?: string | null
          last_used_at?: string | null
          name?: string | null
          request_count?: number | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          key_prefix?: string | null
          last_used_at?: string | null
          name?: string | null
          request_count?: number | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contract_signatures_safe: {
        Row: {
          blockchain_tx_hash: string | null
          blockchain_verified_at: string | null
          contract_id: string | null
          created_at: string | null
          id: string | null
          signatory_email_masked: string | null
          signatory_name: string | null
          signatory_type: Database["public"]["Enums"]["signatory_type"] | null
          signature_method:
            | Database["public"]["Enums"]["signature_method"]
            | null
          signed_at: string | null
          updated_at: string | null
        }
        Insert: {
          blockchain_tx_hash?: string | null
          blockchain_verified_at?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string | null
          signatory_email_masked?: never
          signatory_name?: string | null
          signatory_type?: Database["public"]["Enums"]["signatory_type"] | null
          signature_method?:
            | Database["public"]["Enums"]["signature_method"]
            | null
          signed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          blockchain_tx_hash?: string | null
          blockchain_verified_at?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string | null
          signatory_email_masked?: never
          signatory_name?: string | null
          signatory_type?: Database["public"]["Enums"]["signatory_type"] | null
          signature_method?:
            | Database["public"]["Enums"]["signature_method"]
            | null
          signed_at?: string | null
          updated_at?: string | null
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
      employees_public: {
        Row: {
          company_id: string | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_number: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          hire_date: string | null
          id: string | null
          name: string | null
          name_kana: string | null
          phone: string | null
          position: string | null
          resignation_date: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hire_date?: string | null
          id?: string | null
          name?: string | null
          name_kana?: string | null
          phone?: string | null
          position?: string | null
          resignation_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hire_date?: string | null
          id?: string | null
          name?: string | null
          name_kana?: string | null
          phone?: string | null
          position?: string | null
          resignation_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees_safe: {
        Row: {
          company_id: string | null
          created_at: string | null
          department: string | null
          employee_number: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          hire_date: string | null
          id: string | null
          name: string | null
          name_kana: string | null
          position: string | null
          resignation_date: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          employee_number?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hire_date?: string | null
          id?: string | null
          name?: string | null
          name_kana?: string | null
          position?: string | null
          resignation_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          employee_number?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hire_date?: string | null
          id?: string | null
          name?: string | null
          name_kana?: string | null
          position?: string | null
          resignation_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      anonymize_old_signature_ips: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_limit_per_hour?: number
          p_limit_per_minute?: number
          p_user_id: string
        }
        Returns: Json
      }
      cleanup_expired_otp_codes: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: number }
      generate_asset_code: {
        Args: {
          p_asset_type: Database["public"]["Enums"]["asset_type"]
          p_user_id: string
        }
        Returns: string
      }
      generate_employee_number: { Args: { p_user_id: string }; Returns: string }
      get_company_members_by_company: {
        Args: { p_company_id: string }
        Returns: {
          user_id: string
        }[]
      }
      has_hr_access: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      has_hr_payroll_permission: {
        Args: { p_company_id?: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          p_company_id: string
          p_permission: Database["public"]["Enums"]["permission_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _company_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { p_company_id: string; p_user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { p_company_id: string; p_user_id: string }
        Returns: boolean
      }
      log_client_access: {
        Args: { p_client_id?: string; p_user_id: string }
        Returns: undefined
      }
      log_data_access: {
        Args: {
          p_ip_address?: string
          p_operation: string
          p_query_details?: Json
          p_record_count?: number
          p_record_id?: string
          p_table_name: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      update_api_key_usage: { Args: { p_key_hash: string }; Returns: undefined }
      validate_api_key: { Args: { p_key_hash: string }; Returns: string }
      verify_signature_securely: {
        Args: { p_signature_id: string }
        Returns: {
          is_valid: boolean
          signatory_name: string
          signed_at: string
        }[]
      }
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      activity_type: "call" | "meeting" | "email" | "visit" | "demo" | "other"
      app_role: "admin" | "hr" | "manager" | "user"
      asset_category:
        | "building"
        | "vehicle"
        | "equipment"
        | "software"
        | "furniture"
        | "other"
      asset_status: "in_use" | "in_stock" | "maintenance" | "disposed"
      asset_type:
        | "pc"
        | "mobile"
        | "monitor"
        | "furniture"
        | "software_license"
        | "other"
      attendance_status:
        | "present"
        | "absent"
        | "paid_leave"
        | "sick_leave"
        | "remote"
        | "half_day"
      boost_status: "pending" | "approved" | "completed" | "rejected"
      contract_status:
        | "draft"
        | "sent"
        | "pending_signature"
        | "partially_signed"
        | "signed"
        | "expired"
        | "cancelled"
      deal_stage:
        | "initial"
        | "proposal"
        | "negotiation"
        | "contract"
        | "won"
        | "lost"
      depreciation_method: "straight_line" | "declining_balance"
      email_purpose:
        | "lead_capture"
        | "support"
        | "invoice"
        | "contract"
        | "recruit"
        | "general"
        | "ai_command"
      employee_status: "active" | "on_leave" | "resigned"
      employment_type: "full_time" | "part_time" | "contract" | "intern"
      estimate_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      expense_status: "draft" | "pending" | "approved" | "rejected" | "paid"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      invoice_status:
        | "draft"
        | "sent"
        | "pending"
        | "paid"
        | "overdue"
        | "cancelled"
      journal_source_type:
        | "manual"
        | "invoice"
        | "payment"
        | "expense"
        | "depreciation"
        | "purchase_order"
      lead_source:
        | "website"
        | "referral"
        | "exhibition"
        | "cold_call"
        | "advertising"
        | "other"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      member_role: "owner" | "admin" | "member" | "viewer"
      payroll_status: "draft" | "calculated" | "approved" | "paid"
      permission_type:
        | "invoices_view"
        | "invoices_create"
        | "invoices_edit"
        | "invoices_delete"
        | "contracts_view"
        | "contracts_create"
        | "contracts_edit"
        | "contracts_delete"
        | "contracts_sign"
        | "crm_view"
        | "crm_create"
        | "crm_edit"
        | "crm_delete"
        | "hr_view"
        | "hr_create"
        | "hr_edit"
        | "hr_delete"
        | "hr_payroll"
        | "accounting_view"
        | "accounting_create"
        | "accounting_edit"
        | "accounting_delete"
        | "wiki_view"
        | "wiki_create"
        | "wiki_edit"
        | "wiki_delete"
        | "it_assets_view"
        | "it_assets_create"
        | "it_assets_edit"
        | "it_assets_delete"
        | "settings_view"
        | "settings_edit"
        | "team_view"
        | "team_invite"
        | "team_edit"
        | "team_remove"
        | "credits_view"
        | "credits_purchase"
        | "credits_manage"
        | "admin"
      purchase_order_status:
        | "draft"
        | "sent"
        | "confirmed"
        | "delivered"
        | "cancelled"
      signatory_type: "issuer" | "recipient"
      signature_method: "email_otp" | "wallet"
      target_period_type: "monthly" | "quarterly" | "yearly"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "review" | "done"
      trust_rank: "S" | "A" | "B" | "C" | "D"
      wiki_category:
        | "manual"
        | "policy"
        | "minutes"
        | "announcement"
        | "template"
        | "other"
      year_end_status: "pending" | "submitted" | "completed"
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
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
      activity_type: ["call", "meeting", "email", "visit", "demo", "other"],
      app_role: ["admin", "hr", "manager", "user"],
      asset_category: [
        "building",
        "vehicle",
        "equipment",
        "software",
        "furniture",
        "other",
      ],
      asset_status: ["in_use", "in_stock", "maintenance", "disposed"],
      asset_type: [
        "pc",
        "mobile",
        "monitor",
        "furniture",
        "software_license",
        "other",
      ],
      attendance_status: [
        "present",
        "absent",
        "paid_leave",
        "sick_leave",
        "remote",
        "half_day",
      ],
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
      deal_stage: [
        "initial",
        "proposal",
        "negotiation",
        "contract",
        "won",
        "lost",
      ],
      depreciation_method: ["straight_line", "declining_balance"],
      email_purpose: [
        "lead_capture",
        "support",
        "invoice",
        "contract",
        "recruit",
        "general",
        "ai_command",
      ],
      employee_status: ["active", "on_leave", "resigned"],
      employment_type: ["full_time", "part_time", "contract", "intern"],
      estimate_status: ["draft", "sent", "accepted", "rejected", "expired"],
      expense_status: ["draft", "pending", "approved", "rejected", "paid"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      invoice_status: [
        "draft",
        "sent",
        "pending",
        "paid",
        "overdue",
        "cancelled",
      ],
      journal_source_type: [
        "manual",
        "invoice",
        "payment",
        "expense",
        "depreciation",
        "purchase_order",
      ],
      lead_source: [
        "website",
        "referral",
        "exhibition",
        "cold_call",
        "advertising",
        "other",
      ],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      member_role: ["owner", "admin", "member", "viewer"],
      payroll_status: ["draft", "calculated", "approved", "paid"],
      permission_type: [
        "invoices_view",
        "invoices_create",
        "invoices_edit",
        "invoices_delete",
        "contracts_view",
        "contracts_create",
        "contracts_edit",
        "contracts_delete",
        "contracts_sign",
        "crm_view",
        "crm_create",
        "crm_edit",
        "crm_delete",
        "hr_view",
        "hr_create",
        "hr_edit",
        "hr_delete",
        "hr_payroll",
        "accounting_view",
        "accounting_create",
        "accounting_edit",
        "accounting_delete",
        "wiki_view",
        "wiki_create",
        "wiki_edit",
        "wiki_delete",
        "it_assets_view",
        "it_assets_create",
        "it_assets_edit",
        "it_assets_delete",
        "settings_view",
        "settings_edit",
        "team_view",
        "team_invite",
        "team_edit",
        "team_remove",
        "credits_view",
        "credits_purchase",
        "credits_manage",
        "admin",
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
      target_period_type: ["monthly", "quarterly", "yearly"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "review", "done"],
      trust_rank: ["S", "A", "B", "C", "D"],
      wiki_category: [
        "manual",
        "policy",
        "minutes",
        "announcement",
        "template",
        "other",
      ],
      year_end_status: ["pending", "submitted", "completed"],
    },
  },
} as const
