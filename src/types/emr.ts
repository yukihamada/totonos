// EMR (Electronic Medical Record) Types

// Patient - 患者情報
export interface Patient {
  id: string;
  patient_number: string;        // 患者番号
  name: string;                  // 氏名
  name_kana: string;             // 氏名（カナ）
  birth_date: string;            // 生年月日 (YYYY-MM-DD)
  gender: 'male' | 'female' | 'other';  // 性別
  insurance_number?: string;     // 保険証番号
  insurance_type?: InsuranceType;
  insurance_expiry?: string;     // 保険証有効期限
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;    // 緊急連絡先
  allergies?: string;            // アレルギー情報
  notes?: string;                // 備考
  created_at: string;
  updated_at: string;
}

// Insurance Types - 保険種別
export type InsuranceType =
  | 'national_health'     // 国民健康保険
  | 'employee_health'     // 社会保険（協会けんぽ等）
  | 'late_elderly'        // 後期高齢者医療
  | 'welfare'             // 生活保護
  | 'self_pay';           // 自費

// Medical Record (SOAP format) - カルテ
export interface MedicalRecord {
  id: string;
  patient_id: string;
  record_date: string;           // 診療日 (YYYY-MM-DD)

  // SOAP format
  subjective: string;            // S: 主観的情報（患者の訴え）
  objective: string;             // O: 客観的情報（診察所見）
  assessment: string;            // A: 評価・診断
  plan: string;                  // P: 計画・治療方針

  // Diagnosis
  icd10_codes?: string[];        // ICD-10診断コード
  diagnosis_names?: string[];    // 病名

  // Finalization & Signature
  is_finalized: boolean;         // 確定済み（変更不可）
  finalized_at?: string;
  finalized_by?: string;

  // HPKI Signature
  signature_hash?: string;       // 電子署名ハッシュ
  signed_at?: string;
  signer_name?: string;          // 署名者名（HPKI証明書から取得）

  // Versioning
  version: number;
  previous_version_id?: string;

  created_at: string;
  updated_at: string;
  created_by: string;
}

// Reception Entry - 受付
export interface ReceptionEntry {
  id: string;
  patient_id: string;
  patient?: Patient;             // Joined data
  reception_date: string;        // 受付日時
  reception_number: number;      // 受付番号（当日の順番）
  status: ReceptionStatus;
  department?: string;           // 診療科
  scheduled_time?: string;       // 予約時刻
  chief_complaint?: string;      // 主訴
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Reception Status - 受付状態
export type ReceptionStatus =
  | 'waiting'       // 待機中
  | 'called'        // 呼び出し中
  | 'in_progress'   // 診察中
  | 'completed'     // 診察完了
  | 'cancelled';    // キャンセル

// HPKI Bridge Types

// Bridge Status - ブリッジ接続状態
export interface HpkiBridgeStatus {
  connected: boolean;            // サーバー接続状態
  cardInserted: boolean;         // ICカード挿入状態
  cardHolderName?: string;       // カード保持者名
  readerName?: string;           // リーダー名
  lastChecked?: string;
  error?: string;
}

// Signature Request - 署名リクエスト
export interface HpkiSignatureRequest {
  text_data: string;             // 署名対象テキスト
  pin: string;                   // ICカードPIN
}

// Signature Response - 署名レスポンス
export interface HpkiSignatureResponse {
  signature_hex?: string;        // 署名（16進数文字列）
  error?: string;
}

// Reader Info - リーダー情報
export interface HpkiReaderInfo {
  name: string;
  hasCard: boolean;
  atr?: string;                  // Answer to Reset
}

// Audit Log Entry - 監査ログ（将来実装）
export interface EmrAuditLogEntry {
  id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'sign' | 'export';
  entity_type: 'patient' | 'record' | 'reception';
  entity_id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  details?: string;
  ip_address?: string;
}
