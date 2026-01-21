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
      ai_automation_drafts: {
        Row: {
          action_type: string | null
          collected_data: Json
          company_id: string
          created_at: string
          expires_at: string
          id: string
          missing_fields: string[]
          original_instruction: string
          status: string
          user_id: string
        }
        Insert: {
          action_type?: string | null
          collected_data?: Json
          company_id: string
          created_at?: string
          expires_at?: string
          id?: string
          missing_fields?: string[]
          original_instruction: string
          status?: string
          user_id: string
        }
        Update: {
          action_type?: string | null
          collected_data?: Json
          company_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          missing_fields?: string[]
          original_instruction?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_automation_drafts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_automations: {
        Row: {
          action_config: Json
          action_type: string
          client_id: string | null
          company_id: string
          created_at: string
          description: string | null
          event_type: string | null
          id: string
          is_active: boolean
          last_error: string | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          run_count: number
          schedule_cron: string | null
          schedule_description: string | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          client_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          run_count?: number
          schedule_cron?: string | null
          schedule_description?: string | null
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          client_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          run_count?: number
          schedule_cron?: string | null
          schedule_description?: string | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_automations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_automations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      class_bookings: {
        Row: {
          booked_at: string
          booking_date: string
          cancelled_at: string | null
          checked_in_at: string | null
          class_schedule_id: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          status: string
        }
        Insert: {
          booked_at?: string
          booking_date: string
          cancelled_at?: string | null
          checked_in_at?: string | null
          class_schedule_id: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          status?: string
        }
        Update: {
          booked_at?: string
          booking_date?: string
          cancelled_at?: string | null
          checked_in_at?: string | null
          class_schedule_id?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_bookings_class_schedule_id_fkey"
            columns: ["class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          capacity: number | null
          class_type: string
          color: string | null
          company_id: string
          created_at: string
          current_bookings: number
          day_of_week: number | null
          description: string | null
          end_time: string
          id: string
          instructor_id: string | null
          instructor_name: string | null
          is_active: boolean
          is_recurring: boolean
          location: string | null
          price: number | null
          requires_booking: boolean
          specific_date: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          class_type?: string
          color?: string | null
          company_id: string
          created_at?: string
          current_bookings?: number
          day_of_week?: number | null
          description?: string | null
          end_time: string
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_active?: boolean
          is_recurring?: boolean
          location?: string | null
          price?: number | null
          requires_booking?: boolean
          specific_date?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          class_type?: string
          color?: string | null
          company_id?: string
          created_at?: string
          current_bookings?: number
          day_of_week?: number | null
          description?: string | null
          end_time?: string
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_active?: boolean
          is_recurring?: boolean
          location?: string | null
          price?: number | null
          requires_booking?: boolean
          specific_date?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaning_tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          checklist: Json | null
          company_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          photos: Json | null
          property_id: string
          scheduled_date: string
          scheduled_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          checklist?: Json | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photos?: Json | null
          property_id: string
          scheduled_date: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          checklist?: Json | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photos?: Json | null
          property_id?: string
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vacation_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "vacation_rentals"
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
          branding_settings: Json | null
          created_at: string
          created_by: string
          display_name: string | null
          email: string | null
          employee_count: string | null
          fiscal_year_start_month: number | null
          id: string
          industry: string | null
          invoice_registration_number: string | null
          logo_url: string | null
          name: string
          phone: string | null
          slug: string | null
          template_applied_at: string | null
          template_id: string | null
          updated_at: string
          verified_email_addresses: string[] | null
          website: string | null
        }
        Insert: {
          address?: string | null
          branding_settings?: Json | null
          created_at?: string
          created_by: string
          display_name?: string | null
          email?: string | null
          employee_count?: string | null
          fiscal_year_start_month?: number | null
          id?: string
          industry?: string | null
          invoice_registration_number?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          slug?: string | null
          template_applied_at?: string | null
          template_id?: string | null
          updated_at?: string
          verified_email_addresses?: string[] | null
          website?: string | null
        }
        Update: {
          address?: string | null
          branding_settings?: Json | null
          created_at?: string
          created_by?: string
          display_name?: string | null
          email?: string | null
          employee_count?: string | null
          fiscal_year_start_month?: number | null
          id?: string
          industry?: string | null
          invoice_registration_number?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string | null
          template_applied_at?: string | null
          template_id?: string | null
          updated_at?: string
          verified_email_addresses?: string[] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
            referencedColumns: ["id"]
          },
        ]
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
      company_merge_requests: {
        Row: {
          completed_at: string | null
          confirmation_token: string
          confirmed_by: string | null
          created_at: string
          expires_at: string
          id: string
          requested_by: string
          source_company_id: string
          status: string
          target_company_id: string
        }
        Insert: {
          completed_at?: string | null
          confirmation_token?: string
          confirmed_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          requested_by: string
          source_company_id: string
          status?: string
          target_company_id: string
        }
        Update: {
          completed_at?: string | null
          confirmation_token?: string
          confirmed_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          requested_by?: string
          source_company_id?: string
          status?: string
          target_company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_merge_requests_source_company_id_fkey"
            columns: ["source_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_merge_requests_target_company_id_fkey"
            columns: ["target_company_id"]
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
      delivery_note_items: {
        Row: {
          amount: number | null
          created_at: string
          delivery_note_id: string
          id: string
          is_matched: boolean | null
          jan_code: string | null
          match_confidence: number | null
          notes: string | null
          product_id: string | null
          product_name: string | null
          quantity: number
          unit_price: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          delivery_note_id: string
          id?: string
          is_matched?: boolean | null
          jan_code?: string | null
          match_confidence?: number | null
          notes?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          unit_price?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          delivery_note_id?: string
          id?: string
          is_matched?: boolean | null
          jan_code?: string | null
          match_confidence?: number | null
          notes?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_note_items_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_note_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          company_id: string | null
          created_at: string
          delivery_date: string
          delivery_note_number: string | null
          id: string
          metadata: Json | null
          notes: string | null
          ocr_processed_at: string | null
          ocr_result: Json | null
          original_file_url: string | null
          purchase_order_id: string | null
          received_date: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string | null
          supplier_name: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          delivery_date?: string
          delivery_note_number?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          ocr_processed_at?: string | null
          ocr_result?: Json | null
          original_file_url?: string | null
          purchase_order_id?: string | null
          received_date?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          supplier_name?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          delivery_date?: string
          delivery_note_number?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          ocr_processed_at?: string | null
          ocr_result?: Json | null
          original_file_url?: string | null
          purchase_order_id?: string | null
          received_date?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          supplier_name?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      email_integrations: {
        Row: {
          access_token: string | null
          auto_log: boolean | null
          company_id: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          scopes: string[] | null
          sync_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          auto_log?: boolean | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          scopes?: string[] | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          auto_log?: boolean | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          scopes?: string[] | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      email_verification_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          inbound_email_id: string | null
          rejected_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          inbound_email_id?: string | null
          rejected_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          inbound_email_id?: string | null
          rejected_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_verification_requests_inbound_email_id_fkey"
            columns: ["inbound_email_id"]
            isOneToOne: false
            referencedRelation: "inbound_emails"
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
      emr_appointment_slots: {
        Row: {
          company_id: string
          created_at: string | null
          day_of_week: number | null
          department: string | null
          end_time: string
          id: string
          is_active: boolean | null
          max_appointments: number | null
          slot_duration: number | null
          start_time: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          day_of_week?: number | null
          department?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          max_appointments?: number | null
          slot_duration?: number | null
          start_time: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          day_of_week?: number | null
          department?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_appointments?: number | null
          slot_duration?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "emr_appointment_slots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          company_id: string
          created_at: string | null
          department: string | null
          doctor_name: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string | null
          reminder_sent: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          company_id: string
          created_at?: string | null
          department?: string | null
          doctor_name?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          company_id?: string
          created_at?: string | null
          department?: string | null
          doctor_name?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_billing_details: {
        Row: {
          billing_date: string
          company_id: string
          copay_ratio: number | null
          created_at: string | null
          id: string
          insurance_amount: number | null
          insurance_type: string | null
          items: Json
          paid_at: string | null
          patient_amount: number | null
          patient_id: string | null
          payment_method: string | null
          payment_status: string | null
          reception_id: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          billing_date: string
          company_id: string
          copay_ratio?: number | null
          created_at?: string | null
          id?: string
          insurance_amount?: number | null
          insurance_type?: string | null
          items?: Json
          paid_at?: string | null
          patient_amount?: number | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reception_id?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_date?: string
          company_id?: string
          copay_ratio?: number | null
          created_at?: string | null
          id?: string
          insurance_amount?: number | null
          insurance_type?: string | null
          items?: Json
          paid_at?: string | null
          patient_amount?: number | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reception_id?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_billing_details_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_billing_details_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_billing_details_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "emr_receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_billing_masters: {
        Row: {
          category: string | null
          code: string
          company_id: string
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean | null
          name: string
          points: number
        }
        Insert: {
          category?: string | null
          code: string
          company_id: string
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points: number
        }
        Update: {
          category?: string | null
          code?: string
          company_id?: string
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "emr_billing_masters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_checkup_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          company_id: string
          course_id: string | null
          created_at: string | null
          id: string
          patient_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          company_id: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          company_id?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_checkup_appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_checkup_appointments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "emr_checkup_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_checkup_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_checkup_courses: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          items: Json
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_checkup_courses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_checkup_results: {
        Row: {
          appointment_id: string | null
          checkup_date: string
          company_id: string
          course_name: string | null
          created_at: string | null
          doctor_comment: string | null
          id: string
          overall_judgement: string | null
          patient_id: string | null
          pdf_url: string | null
          results: Json
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          checkup_date: string
          company_id: string
          course_name?: string | null
          created_at?: string | null
          doctor_comment?: string | null
          id?: string
          overall_judgement?: string | null
          patient_id?: string | null
          pdf_url?: string | null
          results?: Json
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          checkup_date?: string
          company_id?: string
          course_name?: string | null
          created_at?: string | null
          doctor_comment?: string | null
          id?: string
          overall_judgement?: string | null
          patient_id?: string | null
          pdf_url?: string | null
          results?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_checkup_results_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "emr_checkup_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_checkup_results_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_checkup_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_home_visit_plans: {
        Row: {
          address: string | null
          care_plan: string | null
          company_id: string
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          patient_id: string | null
          preferred_day: string | null
          preferred_time: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          care_plan?: string | null
          company_id: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
          preferred_day?: string | null
          preferred_time?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          care_plan?: string | null
          company_id?: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
          preferred_day?: string | null
          preferred_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_home_visit_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_home_visit_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_home_visits: {
        Row: {
          address: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          doctor_name: string | null
          id: string
          notes: string | null
          nurse_name: string | null
          patient_id: string | null
          plan_id: string | null
          record_id: string | null
          status: string | null
          updated_at: string | null
          visit_date: string
          visit_time: string | null
          visit_type: string | null
          vital_signs: Json | null
        }
        Insert: {
          address?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          nurse_name?: string | null
          patient_id?: string | null
          plan_id?: string | null
          record_id?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date: string
          visit_time?: string | null
          visit_type?: string | null
          vital_signs?: Json | null
        }
        Update: {
          address?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          nurse_name?: string | null
          patient_id?: string | null
          plan_id?: string | null
          record_id?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date?: string
          visit_time?: string | null
          visit_type?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_home_visits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_home_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_home_visits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "emr_home_visit_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_home_visits_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "emr_medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_inquiry_responses: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          patient_id: string | null
          reception_id: string | null
          responses: Json
          submitted_at: string | null
          template_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          reception_id?: string | null
          responses?: Json
          submitted_at?: string | null
          template_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          reception_id?: string | null
          responses?: Json
          submitted_at?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_inquiry_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_inquiry_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_inquiry_responses_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "emr_receptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_inquiry_responses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "emr_inquiry_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_inquiry_templates: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          questions: Json
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          questions?: Json
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          questions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_inquiry_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_medical_records: {
        Row: {
          assessment: string | null
          company_id: string
          created_at: string | null
          doctor_name: string | null
          hpki_signature: string | null
          id: string
          is_signed: boolean | null
          objective: string | null
          patient_id: string
          plan: string | null
          prescriptions: Json | null
          procedures: Json | null
          reception_id: string | null
          record_date: string | null
          record_number: string
          signed_at: string | null
          subjective: string | null
          updated_at: string | null
          vital_signs: Json | null
        }
        Insert: {
          assessment?: string | null
          company_id: string
          created_at?: string | null
          doctor_name?: string | null
          hpki_signature?: string | null
          id?: string
          is_signed?: boolean | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          prescriptions?: Json | null
          procedures?: Json | null
          reception_id?: string | null
          record_date?: string | null
          record_number: string
          signed_at?: string | null
          subjective?: string | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Update: {
          assessment?: string | null
          company_id?: string
          created_at?: string | null
          doctor_name?: string | null
          hpki_signature?: string | null
          id?: string
          is_signed?: boolean | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          prescriptions?: Json | null
          procedures?: Json | null
          reception_id?: string | null
          record_date?: string | null
          record_number?: string
          signed_at?: string | null
          subjective?: string | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_medical_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_medical_records_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "emr_receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_medications: {
        Row: {
          company_id: string
          created_at: string | null
          dosage_form: string | null
          generic_name: string | null
          id: string
          is_active: boolean | null
          is_generic: boolean | null
          name: string
          unit: string | null
          yj_code: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          is_generic?: boolean | null
          name: string
          unit?: string | null
          yj_code?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          is_generic?: boolean | null
          name?: string
          unit?: string | null
          yj_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_medications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          birth_date: string | null
          blood_type: string | null
          company_id: string
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          insurance_number: string | null
          insurance_type: string | null
          is_active: boolean | null
          name: string
          name_kana: string | null
          notes: string | null
          patient_number: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          birth_date?: string | null
          blood_type?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_number?: string | null
          insurance_type?: string | null
          is_active?: boolean | null
          name: string
          name_kana?: string | null
          notes?: string | null
          patient_number: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          birth_date?: string | null
          blood_type?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_number?: string | null
          insurance_type?: string | null
          is_active?: boolean | null
          name?: string
          name_kana?: string | null
          notes?: string | null
          patient_number?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_patients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_prescriptions: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          issued_at: string | null
          medications: Json
          patient_id: string | null
          pharmacy_notes: string | null
          prescription_date: string
          prescription_number: string | null
          record_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          medications?: Json
          patient_id?: string | null
          pharmacy_notes?: string | null
          prescription_date: string
          prescription_number?: string | null
          record_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          medications?: Json
          patient_id?: string | null
          pharmacy_notes?: string | null
          prescription_date?: string
          prescription_number?: string | null
          record_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_prescriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_prescriptions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "emr_medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_receipts: {
        Row: {
          billing_month: string
          company_id: string
          created_at: string | null
          id: string
          patient_id: string | null
          receipt_data: Json
          status: string | null
          submitted_at: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          billing_month: string
          company_id: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          receipt_data?: Json
          status?: string | null
          submitted_at?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_month?: string
          company_id?: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          receipt_data?: Json
          status?: string | null
          submitted_at?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_receipts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_receptions: {
        Row: {
          assigned_doctor_name: string | null
          chief_complaint: string | null
          company_id: string
          created_at: string | null
          department: string | null
          id: string
          notes: string | null
          patient_id: string
          reception_date: string | null
          reception_number: string
          reception_time: string | null
          status: string | null
          updated_at: string | null
          visit_type: string | null
        }
        Insert: {
          assigned_doctor_name?: string | null
          chief_complaint?: string | null
          company_id: string
          created_at?: string | null
          department?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reception_date?: string | null
          reception_number: string
          reception_time?: string | null
          status?: string | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Update: {
          assigned_doctor_name?: string | null
          chief_complaint?: string | null
          company_id?: string
          created_at?: string | null
          department?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reception_date?: string | null
          reception_number?: string
          reception_time?: string | null
          status?: string | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_receptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_receptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_telemedicine_sessions: {
        Row: {
          company_id: string
          created_at: string | null
          doctor_name: string | null
          duration_minutes: number | null
          id: string
          meeting_id: string | null
          meeting_url: string | null
          notes: string | null
          patient_id: string | null
          record_id: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          doctor_name?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          record_id?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          doctor_name?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          record_id?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_telemedicine_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_telemedicine_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "emr_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_telemedicine_sessions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "emr_medical_records"
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
      industry_templates: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          hero_image_url: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          name: string
          name_en: string | null
          sort_order: number | null
          template_key: string
          updated_at: string | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          name: string
          name_en?: string | null
          sort_order?: number | null
          template_key: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
          template_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_purchase_order_id: string | null
          company_id: string | null
          created_at: string
          current_value: number | null
          id: string
          product_id: string
          resolved_at: string | null
          status: string | null
          threshold_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          auto_purchase_order_id?: string | null
          company_id?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          product_id: string
          resolved_at?: string | null
          status?: string | null
          threshold_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_purchase_order_id?: string | null
          company_id?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          product_id?: string
          resolved_at?: string | null
          status?: string | null
          threshold_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_auto_purchase_order_id_fkey"
            columns: ["auto_purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          notes: string | null
          performed_by: string | null
          product_id: string
          quantity: number
          quantity_after: number
          quantity_before: number
          reference_id: string | null
          reference_type: string | null
          total_amount: number | null
          transaction_date: string
          transaction_type: string
          unit_price: number | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          product_id: string
          quantity: number
          quantity_after: number
          quantity_before: number
          reference_id?: string | null
          reference_type?: string | null
          total_amount?: number | null
          transaction_date?: string
          transaction_type: string
          unit_price?: number | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          product_id?: string
          quantity?: number
          quantity_after?: number
          quantity_before?: number
          reference_id?: string | null
          reference_type?: string | null
          total_amount?: number | null
          transaction_date?: string
          transaction_type?: string
          unit_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          invoice_registration_number: string | null
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
          invoice_registration_number?: string | null
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
          invoice_registration_number?: string | null
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
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "line_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      member_checkins: {
        Row: {
          booking_id: string | null
          checkin_time: string
          checkout_time: string | null
          company_id: string
          created_at: string
          id: string
          location: string | null
          member_id: string
          method: string
        }
        Insert: {
          booking_id?: string | null
          checkin_time?: string
          checkout_time?: string | null
          company_id: string
          created_at?: string
          id?: string
          location?: string | null
          member_id: string
          method?: string
        }
        Update: {
          booking_id?: string | null
          checkin_time?: string
          checkout_time?: string | null
          company_id?: string
          created_at?: string
          id?: string
          location?: string | null
          member_id?: string
          method?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "class_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_checkins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
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
      member_purchases: {
        Row: {
          company_id: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          product_id: string | null
          product_name: string
          purchased_at: string
          quantity: number
          stripe_payment_intent_id: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          product_id?: string | null
          product_name: string
          purchased_at?: string
          quantity?: number
          stripe_payment_intent_id?: string | null
          total_amount: number
          unit_price: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          product_id?: string | null
          product_name?: string
          purchased_at?: string
          quantity?: number
          stripe_payment_intent_id?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "member_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_purchases_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      member_subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          end_date: string | null
          id: string
          member_id: string
          next_billing_date: string | null
          pause_end: string | null
          pause_start: string | null
          plan_id: string | null
          remaining_classes: number | null
          start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          member_id: string
          next_billing_date?: string | null
          pause_end?: string | null
          pause_start?: string | null
          plan_id?: string | null
          remaining_classes?: number | null
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          member_id?: string
          next_billing_date?: string | null
          pause_end?: string | null
          pause_start?: string | null
          plan_id?: string | null
          remaining_classes?: number | null
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          birth_date: string | null
          company_id: string
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          expire_date: string | null
          gender: string | null
          id: string
          join_date: string
          member_number: string
          membership_type: string
          metadata: Json | null
          name: string
          name_kana: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          status: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          expire_date?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          member_number: string
          membership_type?: string
          metadata?: Json | null
          name: string
          name_kana?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          expire_date?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          member_number?: string
          membership_type?: string
          metadata?: Json | null
          name?: string
          name_kana?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          billing_cycle: string | null
          company_id: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          included_classes: number | null
          is_active: boolean
          name: string
          plan_type: string
          price: number
          sort_order: number | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          included_classes?: number | null
          is_active?: boolean
          name: string
          plan_type: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          included_classes?: number | null
          is_active?: boolean
          name?: string
          plan_type?: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      products: {
        Row: {
          barcode_image_url: string | null
          category: string | null
          company_id: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          is_inventory_managed: boolean | null
          jan_code: string | null
          lead_time_days: number | null
          location: string | null
          metadata: Json | null
          min_stock: number | null
          name: string
          name_kana: string | null
          notes: string | null
          price: number
          reorder_point: number | null
          reorder_quantity: number | null
          sku: string
          status: string | null
          stock_quantity: number
          supplier_id: string | null
          supplier_product_code: string | null
          tax_rate: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode_image_url?: string | null
          category?: string | null
          company_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_inventory_managed?: boolean | null
          jan_code?: string | null
          lead_time_days?: number | null
          location?: string | null
          metadata?: Json | null
          min_stock?: number | null
          name: string
          name_kana?: string | null
          notes?: string | null
          price?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku: string
          status?: string | null
          stock_quantity?: number
          supplier_id?: string | null
          supplier_product_code?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode_image_url?: string | null
          category?: string | null
          company_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_inventory_managed?: boolean | null
          jan_code?: string | null
          lead_time_days?: number | null
          location?: string | null
          metadata?: Json | null
          min_stock?: number | null
          name?: string
          name_kana?: string | null
          notes?: string | null
          price?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku?: string
          status?: string | null
          stock_quantity?: number
          supplier_id?: string | null
          supplier_product_code?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          progress: number | null
          project_id: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          project_id: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          project_id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          progress: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      synced_calendar_events: {
        Row: {
          attendees: Json | null
          company_id: string | null
          created_at: string
          description: string | null
          end_time: string | null
          external_id: string
          id: string
          integration_id: string | null
          is_all_day: boolean | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          location: string | null
          start_time: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          attendees?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          external_id: string
          id?: string
          integration_id?: string | null
          is_all_day?: boolean | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          location?: string | null
          start_time?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          attendees?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          external_id?: string
          id?: string
          integration_id?: string | null
          is_all_day?: boolean | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          location?: string | null
          start_time?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "synced_calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_calendar_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "email_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      synced_emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          cc_addresses: string[] | null
          company_id: string | null
          created_at: string
          date: string | null
          external_id: string
          from_address: string | null
          has_attachments: boolean | null
          id: string
          integration_id: string | null
          is_read: boolean | null
          labels: string[] | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_addresses: string[] | null
          user_id: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: string[] | null
          company_id?: string | null
          created_at?: string
          date?: string | null
          external_id: string
          from_address?: string | null
          has_attachments?: boolean | null
          id?: string
          integration_id?: string | null
          is_read?: boolean | null
          labels?: string[] | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_addresses?: string[] | null
          user_id: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: string[] | null
          company_id?: string | null
          created_at?: string
          date?: string | null
          external_id?: string
          from_address?: string | null
          has_attachments?: boolean | null
          id?: string
          integration_id?: string | null
          is_read?: boolean | null
          labels?: string[] | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_addresses?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "synced_emails_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_emails_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "email_integrations"
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
      template_accounts: {
        Row: {
          account_code: string
          account_description: string | null
          account_name: string
          account_type: string
          created_at: string | null
          id: string
          is_common: boolean | null
          parent_code: string | null
          sort_order: number | null
          tax_category: string | null
          template_id: string | null
        }
        Insert: {
          account_code: string
          account_description?: string | null
          account_name: string
          account_type: string
          created_at?: string | null
          id?: string
          is_common?: boolean | null
          parent_code?: string | null
          sort_order?: number | null
          tax_category?: string | null
          template_id?: string | null
        }
        Update: {
          account_code?: string
          account_description?: string | null
          account_name?: string
          account_type?: string
          created_at?: string | null
          id?: string
          is_common?: boolean | null
          parent_code?: string | null
          sort_order?: number | null
          tax_category?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_accounts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_landing_content: {
        Row: {
          created_at: string | null
          cta_text: string | null
          faq: Json | null
          features: Json | null
          hero_subtitle: string | null
          hero_title: string
          id: string
          pain_points: Json | null
          solutions: Json | null
          template_id: string | null
          testimonials: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          faq?: Json | null
          features?: Json | null
          hero_subtitle?: string | null
          hero_title: string
          id?: string
          pain_points?: Json | null
          solutions?: Json | null
          template_id?: string | null
          testimonials?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          faq?: Json | null
          features?: Json | null
          hero_subtitle?: string | null
          hero_title?: string
          id?: string
          pain_points?: Json | null
          solutions?: Json | null
          template_id?: string | null
          testimonials?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_landing_content_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_menu_config: {
        Row: {
          created_at: string | null
          dashboard_widgets: Json | null
          emphasized_features: string[] | null
          hidden_features: string[] | null
          id: string
          menu_groups: Json
          mobile_nav_items: Json | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          emphasized_features?: string[] | null
          hidden_features?: string[] | null
          id?: string
          menu_groups?: Json
          mobile_nav_items?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          emphasized_features?: string[] | null
          hidden_features?: string[] | null
          id?: string
          menu_groups?: Json
          mobile_nav_items?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_menu_config_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: true
            referencedRelation: "industry_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_sample_data: {
        Row: {
          created_at: string | null
          data: Json
          data_type: string
          id: string
          is_active: boolean | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          data_type: string
          id?: string
          is_active?: boolean | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          data_type?: string
          id?: string
          is_active?: boolean | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_sample_data_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
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
      vacation_bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          cleaning_fee: number | null
          company_id: string
          created_at: string
          external_booking_id: string | null
          guest_count: number
          guest_email: string | null
          guest_id: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          property_id: string
          source: string | null
          special_requests: Json | null
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          cleaning_fee?: number | null
          company_id: string
          created_at?: string
          external_booking_id?: string | null
          guest_count?: number
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          property_id: string
          source?: string | null
          special_requests?: Json | null
          status?: string
          total_price?: number
          updated_at?: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          cleaning_fee?: number | null
          company_id?: string
          created_at?: string
          external_booking_id?: string | null
          guest_count?: number
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          source?: string | null
          special_requests?: Json | null
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_bookings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "vacation_rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_guests: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          name_kana: string | null
          nationality: string | null
          notes: string | null
          passport_number: string | null
          phone: string | null
          previous_stays: number | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          name_kana?: string | null
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          previous_stays?: number | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          name_kana?: string | null
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          previous_stays?: number | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_guests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_pricing: {
        Row: {
          base_price: number
          company_id: string
          created_at: string
          date: string
          id: string
          is_available: boolean | null
          min_stay: number | null
          price_type: string | null
          property_id: string
        }
        Insert: {
          base_price: number
          company_id: string
          created_at?: string
          date: string
          id?: string
          is_available?: boolean | null
          min_stay?: number | null
          price_type?: string | null
          property_id: string
        }
        Update: {
          base_price?: number
          company_id?: string
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean | null
          min_stay?: number | null
          price_type?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_pricing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_pricing_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "vacation_rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_rentals: {
        Row: {
          address: string | null
          amenities: Json | null
          annual_limit_days: number
          base_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          check_in_time: string | null
          check_out_time: string | null
          cleaning_fee: number | null
          company_id: string
          created_at: string
          description: string | null
          house_rules: string | null
          id: string
          images: Json | null
          location_lat: number | null
          location_lng: number | null
          max_guests: number
          name: string
          property_type: string
          registration_date: string | null
          registration_number: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          annual_limit_days?: number
          base_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          cleaning_fee?: number | null
          company_id: string
          created_at?: string
          description?: string | null
          house_rules?: string | null
          id?: string
          images?: Json | null
          location_lat?: number | null
          location_lng?: number | null
          max_guests?: number
          name: string
          property_type?: string
          registration_date?: string | null
          registration_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          annual_limit_days?: number
          base_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          cleaning_fee?: number | null
          company_id?: string
          created_at?: string
          description?: string | null
          house_rules?: string | null
          id?: string
          images?: Json | null
          location_lat?: number | null
          location_lng?: number | null
          max_guests?: number
          name?: string
          property_type?: string
          registration_date?: string | null
          registration_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_rentals_company_id_fkey"
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
      generate_emr_patient_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      generate_emr_reception_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      generate_emr_record_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      generate_product_sku: {
        Args: { p_category?: string; p_user_id: string }
        Returns: string
      }
      generate_random_email_prefix: { Args: never; Returns: string }
      get_company_members_by_company: {
        Args: { p_company_id: string }
        Returns: {
          user_id: string
        }[]
      }
      get_operating_days: {
        Args: { p_property_id: string; p_year?: number }
        Returns: number
      }
      has_hr_access: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      has_hr_payroll_permission: {
        Args: { p_company_id?: string }
        Returns: boolean
      }
      has_medical_permission: {
        Args: { p_company_id: string; p_user_id: string }
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
      is_company_admin_via_roles: {
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
