export type ServiceCategory = 
  | 'accounting' 
  | 'crm' 
  | 'hr' 
  | 'business' 
  | 'communication' 
  | 'calendar' 
  | 'storage';

export type AuthType = 'api_key' | 'oauth2' | 'api_token';

export type ConnectionStatus = 'pending' | 'active' | 'error' | 'expired';

export interface ExternalServiceType {
  id: string;
  name: string;
  category: ServiceCategory;
  icon_name: string | null;
  auth_type: AuthType;
  config: {
    api_base?: string;
    scopes?: string[];
    requires_subdomain?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface ExternalConnection {
  id: string;
  user_id: string;
  company_id: string | null;
  service_type: string;
  display_name: string | null;
  credentials: Record<string, string>;
  settings: {
    sync_enabled?: boolean;
    sync_interval?: number;
    sync_items?: string[];
    subdomain?: string;
  };
  status: ConnectionStatus;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  service?: ExternalServiceType;
}

export interface ConnectionFormData {
  service_type: string;
  display_name?: string;
  credentials: Record<string, string>;
  settings?: Record<string, unknown>;
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  accounting: '会計',
  crm: 'CRM',
  hr: '人事労務',
  business: '業務ツール',
  communication: 'コミュニケーション',
  calendar: 'カレンダー',
  storage: 'ストレージ',
};

export const STATUS_LABELS: Record<ConnectionStatus, string> = {
  pending: '確認中',
  active: '接続中',
  error: 'エラー',
  expired: '期限切れ',
};
