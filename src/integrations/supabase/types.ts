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
      employees: {
        Row: {
          bank_account_number: string | null
          bank_account_type: string | null
          bank_branch: string | null
          bank_name: string | null
          base_salary: number | null
          birth_date: string | null
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
        Relationships: []
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_asset_code: {
        Args: {
          p_asset_type: Database["public"]["Enums"]["asset_type"]
          p_user_id: string
        }
        Returns: string
      }
      generate_employee_number: { Args: { p_user_id: string }; Returns: string }
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      activity_type: "call" | "meeting" | "email" | "visit" | "demo" | "other"
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
      employee_status: "active" | "on_leave" | "resigned"
      employment_type: "full_time" | "part_time" | "contract" | "intern"
      estimate_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      expense_status: "draft" | "pending" | "approved" | "rejected" | "paid"
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
      payroll_status: "draft" | "calculated" | "approved" | "paid"
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
      employee_status: ["active", "on_leave", "resigned"],
      employment_type: ["full_time", "part_time", "contract", "intern"],
      estimate_status: ["draft", "sent", "accepted", "rejected", "expired"],
      expense_status: ["draft", "pending", "approved", "rejected", "paid"],
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
      payroll_status: ["draft", "calculated", "approved", "paid"],
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
