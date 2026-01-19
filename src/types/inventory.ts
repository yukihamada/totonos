export interface Product {
  id: string;
  user_id: string;
  company_id: string | null;
  sku: string;
  jan_code: string | null;
  name: string;
  name_kana: string | null;
  description: string | null;
  category: string | null;
  price: number;
  cost: number | null;
  tax_rate: number | null;
  stock_quantity: number;
  min_stock: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  unit: string | null;
  location: string | null;
  supplier_id: string | null;
  supplier_product_code: string | null;
  lead_time_days: number | null;
  status: 'active' | 'inactive' | 'discontinued';
  is_inventory_managed: boolean | null;
  barcode_image_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  sku: string;
  jan_code?: string | null;
  name: string;
  name_kana?: string | null;
  description?: string | null;
  category?: string | null;
  price: number;
  cost?: number | null;
  tax_rate?: number | null;
  stock_quantity?: number;
  min_stock?: number | null;
  reorder_point?: number | null;
  reorder_quantity?: number | null;
  unit?: string | null;
  location?: string | null;
  supplier_id?: string | null;
  supplier_product_code?: string | null;
  lead_time_days?: number | null;
  status?: 'active' | 'inactive' | 'discontinued';
  is_inventory_managed?: boolean | null;
  notes?: string | null;
}

export interface InventoryTransaction {
  id: string;
  user_id: string;
  company_id: string | null;
  product_id: string;
  transaction_type: 
    | 'purchase'
    | 'sale'
    | 'adjustment'
    | 'transfer_in'
    | 'transfer_out'
    | 'return_in'
    | 'return_out'
    | 'disposal'
    | 'delivery_receipt';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  unit_price: number | null;
  total_amount: number | null;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  performed_by: string | null;
  transaction_date: string;
  created_at: string;
}

export interface InventoryAlert {
  id: string;
  user_id: string;
  company_id: string | null;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'reorder_needed' | 'overstock';
  threshold_value: number | null;
  current_value: number | null;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  auto_purchase_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNote {
  id: string;
  user_id: string;
  company_id: string | null;
  delivery_note_number: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  purchase_order_id: string | null;
  delivery_date: string;
  received_date: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  original_file_url: string | null;
  ocr_result: Record<string, unknown> | null;
  ocr_processed_at: string | null;
  status: 'pending' | 'processing' | 'review' | 'confirmed' | 'applied';
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNoteItem {
  id: string;
  delivery_note_id: string;
  product_id: string | null;
  jan_code: string | null;
  product_name: string | null;
  quantity: number;
  unit_price: number | null;
  amount: number | null;
  is_matched: boolean | null;
  match_confidence: number | null;
  notes: string | null;
  created_at: string;
}

// 商品カテゴリ（クリニック向け拡張）
export const PRODUCT_CATEGORIES = [
  'サービス',
  'ハードウェア',
  'ソフトウェア',
  '医薬品',
  '医療材料',
  '消耗品',
  'その他',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// トランザクションタイプの日本語ラベル
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  purchase: '仕入',
  sale: '販売',
  adjustment: '在庫調整',
  transfer_in: '移動入庫',
  transfer_out: '移動出庫',
  return_in: '返品入庫',
  return_out: '返品出庫',
  disposal: '廃棄',
  delivery_receipt: '納品書取込',
};

// アラートタイプの日本語ラベル
export const ALERT_TYPE_LABELS: Record<string, string> = {
  low_stock: '在庫少',
  out_of_stock: '在庫切れ',
  reorder_needed: '発注必要',
  overstock: '過剰在庫',
};
