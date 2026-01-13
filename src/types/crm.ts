// CRM Types

export type LeadSource = 'website' | 'referral' | 'exhibition' | 'cold_call' | 'advertising' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type DealStage = 'initial' | 'proposal' | 'negotiation' | 'contract' | 'won' | 'lost';
export type ActivityType = 'call' | 'meeting' | 'email' | 'visit' | 'demo' | 'other';
export type TargetPeriodType = 'monthly' | 'quarterly' | 'yearly';

export interface Lead {
  id: string;
  user_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  assigned_to?: string;
  notes?: string;
  converted_to_client_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  lead_id?: string;
  client_id?: string;
  deal_name: string;
  amount: number;
  stage: DealStage;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  notes?: string;
  estimate_id?: string;
  contract_id?: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  client?: { name: string };
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  subject: string;
  description?: string;
  activity_date: string;
  lead_id?: string;
  deal_id?: string;
  client_id?: string;
  duration_minutes?: number;
  next_action?: string;
  next_action_date?: string;
  created_at: string;
  lead?: Lead;
  deal?: Deal;
  client?: { name: string };
}

export interface SalesTarget {
  id: string;
  user_id: string;
  period_type: TargetPeriodType;
  period_start: string;
  period_end: string;
  target_amount: number;
  achieved_amount: number;
  created_at: string;
  updated_at: string;
}

// Pipeline stage colors
export const stageColors: Record<DealStage, string> = {
  initial: 'bg-muted',
  proposal: 'bg-blue-100 dark:bg-blue-900',
  negotiation: 'bg-yellow-100 dark:bg-yellow-900',
  contract: 'bg-purple-100 dark:bg-purple-900',
  won: 'bg-green-100 dark:bg-green-900',
  lost: 'bg-red-100 dark:bg-red-900',
};

export const stageLabels: Record<DealStage, string> = {
  initial: '初期接触',
  proposal: '提案中',
  negotiation: '交渉中',
  contract: '契約手続き',
  won: '受注',
  lost: '失注',
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: '新規',
  contacted: '連絡済み',
  qualified: '見込み確定',
  converted: '顧客化',
  lost: '失注',
};

export const sourceLabels: Record<LeadSource, string> = {
  website: 'ウェブサイト',
  referral: '紹介',
  exhibition: '展示会',
  cold_call: '電話営業',
  advertising: '広告',
  other: 'その他',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  call: '電話',
  meeting: '会議',
  email: 'メール',
  visit: '訪問',
  demo: 'デモ',
  other: 'その他',
};
