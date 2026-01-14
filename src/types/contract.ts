// Contract types for Totonos
export type ContractStatus = 'draft' | 'sent' | 'pending_signature' | 'partially_signed' | 'signed' | 'expired' | 'cancelled';
export type SignatoryType = 'issuer' | 'recipient';
export type SignatureMethod = 'email_otp' | 'wallet';

export interface Contract {
  id: string;
  user_id: string;
  client_id: string | null;
  contract_number: string;
  title: string;
  content: string | null;
  content_hash: string | null;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  status: ContractStatus;
  issue_date: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    email: string | null;
  };
  signatures?: ContractSignature[];
}

export interface ContractItem {
  id: string;
  contract_id: string;
  title: string;
  content: string;
  item_order: number;
  created_at: string;
}

export interface ContractSignature {
  id: string;
  contract_id: string;
  signatory_type: SignatoryType;
  signatory_name: string | null;
  signatory_email: string;
  signature_method: SignatureMethod;
  signature_token: string | null;
  signed_at: string | null;
  signed_ip: string | null;
  signed_user_agent: string | null;
  otp_code: string | null;
  otp_expires_at: string | null;
  content_hash: string | null;
  blockchain_tx_hash: string | null;
  blockchain_network: string | null;
  blockchain_block_number: number | null;
  blockchain_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignatureVerificationLog {
  id: string;
  contract_id: string;
  verification_result: boolean;
  verified_at: string;
  verified_by_ip: string | null;
  blockchain_confirmed: boolean | null;
  details: Record<string, unknown> | null;
}

// Utility functions
export function getContractStatusColor(status: ContractStatus): string {
  switch (status) {
    case 'draft': return 'bg-muted text-muted-foreground';
    case 'sent': return 'bg-chart-4/20 text-chart-4';
    case 'pending_signature': return 'bg-chart-1/20 text-chart-1';
    case 'partially_signed': return 'bg-chart-3/20 text-chart-3';
    case 'signed': return 'bg-chart-2/20 text-chart-2';
    case 'expired': return 'bg-destructive/20 text-destructive';
    case 'cancelled': return 'bg-muted text-muted-foreground';
  }
}

export function getContractStatusLabel(status: ContractStatus): string {
  switch (status) {
    case 'draft': return '下書き';
    case 'sent': return '送付済み';
    case 'pending_signature': return '署名待ち';
    case 'partially_signed': return '一部署名済み';
    case 'signed': return '締結済み';
    case 'expired': return '期限切れ';
    case 'cancelled': return 'キャンセル';
  }
}
