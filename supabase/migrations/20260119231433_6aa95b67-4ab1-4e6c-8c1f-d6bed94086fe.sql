-- ================================================
-- Phase 1: 商品マスタDB化 + JANコード対応
-- ================================================

-- 1. 商品マスタテーブル（JANコード対応）
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  
  -- 基本情報
  sku VARCHAR(50) NOT NULL,
  jan_code VARCHAR(13),  -- JANコード（8桁または13桁）
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),  -- 読み仮名（検索用）
  description TEXT,
  category VARCHAR(100),
  
  -- 価格情報
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 10,  -- 消費税率
  
  -- 在庫情報
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 0,  -- 最低在庫数（発注点）
  reorder_point INTEGER DEFAULT 0,  -- 発注点（この数量を下回ったら発注）
  reorder_quantity INTEGER DEFAULT 0,  -- 発注数量
  unit VARCHAR(20) DEFAULT '個',  -- 単位
  location VARCHAR(100),  -- 保管場所
  
  -- 仕入先情報
  supplier_id UUID REFERENCES public.clients(id),
  supplier_product_code VARCHAR(100),  -- 仕入先での商品コード
  lead_time_days INTEGER DEFAULT 3,  -- リードタイム（発注から納品までの日数）
  
  -- ステータス
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  is_inventory_managed BOOLEAN DEFAULT true,  -- 在庫管理対象かどうか
  
  -- メタデータ
  barcode_image_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- 制約
  UNIQUE(user_id, sku),
  UNIQUE(user_id, jan_code)
);

-- 2. 在庫トランザクションテーブル（入出庫履歴）
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- トランザクション情報
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
    'purchase',      -- 仕入（入庫）
    'sale',          -- 販売（出庫）
    'adjustment',    -- 在庫調整
    'transfer_in',   -- 移動入庫
    'transfer_out',  -- 移動出庫
    'return_in',     -- 返品入庫
    'return_out',    -- 返品出庫
    'disposal',      -- 廃棄
    'delivery_receipt'  -- 納品書取込
  )),
  
  quantity INTEGER NOT NULL,  -- 正の数=入庫、負の数=出庫
  quantity_before INTEGER NOT NULL,  -- 変更前在庫
  quantity_after INTEGER NOT NULL,   -- 変更後在庫
  
  unit_price DECIMAL(12, 2),  -- 単価
  total_amount DECIMAL(12, 2),  -- 合計金額
  
  -- 関連ドキュメント
  reference_type VARCHAR(50),  -- 'purchase_order', 'invoice', 'delivery_note' 等
  reference_id UUID,
  
  -- メタデータ
  notes TEXT,
  performed_by UUID,  -- 実行者
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 納品書テーブル
CREATE TABLE public.delivery_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  
  -- 納品書情報
  delivery_note_number VARCHAR(50),
  supplier_id UUID REFERENCES public.clients(id),
  supplier_name VARCHAR(255),
  
  -- 関連発注書
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  
  -- 日付
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_date DATE,
  
  -- 金額
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- OCR処理
  original_file_url TEXT,  -- アップロードされた納品書画像/PDF
  ocr_result JSONB,  -- OCR解析結果
  ocr_processed_at TIMESTAMP WITH TIME ZONE,
  
  -- ステータス
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 処理待ち
    'processing',   -- OCR処理中
    'review',       -- 確認待ち
    'confirmed',    -- 確認済み
    'applied'       -- 在庫反映済み
  )),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. 納品書明細テーブル
CREATE TABLE public.delivery_note_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_note_id UUID NOT NULL REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
  
  -- 商品情報
  product_id UUID REFERENCES public.products(id),
  jan_code VARCHAR(13),
  product_name VARCHAR(255),
  
  -- 数量・金額
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2),
  amount DECIMAL(12, 2),
  
  -- マッチング状態
  is_matched BOOLEAN DEFAULT false,  -- 商品マスタとマッチしたかどうか
  match_confidence DECIMAL(5, 2),  -- マッチングの信頼度(0-100)
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. 在庫アラートテーブル
CREATE TABLE public.inventory_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN (
    'low_stock',        -- 在庫少
    'out_of_stock',     -- 在庫切れ
    'reorder_needed',   -- 発注必要
    'overstock'         -- 過剰在庫
  )),
  
  threshold_value INTEGER,  -- アラート発生時の閾値
  current_value INTEGER,    -- アラート発生時の現在値
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- 自動発注書リンク
  auto_purchase_order_id UUID REFERENCES public.purchase_orders(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- インデックス
-- ================================================
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_products_jan_code ON public.products(jan_code);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_low_stock ON public.products(user_id, stock_quantity, reorder_point) 
  WHERE is_inventory_managed = true;

CREATE INDEX idx_inventory_transactions_product_id ON public.inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_user_id ON public.inventory_transactions(user_id);
CREATE INDEX idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_type ON public.inventory_transactions(transaction_type);

CREATE INDEX idx_delivery_notes_user_id ON public.delivery_notes(user_id);
CREATE INDEX idx_delivery_notes_supplier_id ON public.delivery_notes(supplier_id);
CREATE INDEX idx_delivery_notes_status ON public.delivery_notes(status);

CREATE INDEX idx_inventory_alerts_user_id ON public.inventory_alerts(user_id);
CREATE INDEX idx_inventory_alerts_product_id ON public.inventory_alerts(product_id);
CREATE INDEX idx_inventory_alerts_status ON public.inventory_alerts(status);

-- ================================================
-- RLS ポリシー
-- ================================================

-- products テーブル
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- inventory_transactions テーブル
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory transactions"
  ON public.inventory_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory transactions"
  ON public.inventory_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- delivery_notes テーブル
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery notes"
  ON public.delivery_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery notes"
  ON public.delivery_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery notes"
  ON public.delivery_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own delivery notes"
  ON public.delivery_notes FOR DELETE
  USING (auth.uid() = user_id);

-- delivery_note_items テーブル
ALTER TABLE public.delivery_note_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view delivery note items through delivery notes"
  ON public.delivery_note_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_notes dn
      WHERE dn.id = delivery_note_items.delivery_note_id
      AND dn.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert delivery note items through delivery notes"
  ON public.delivery_note_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.delivery_notes dn
      WHERE dn.id = delivery_note_items.delivery_note_id
      AND dn.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update delivery note items through delivery notes"
  ON public.delivery_note_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_notes dn
      WHERE dn.id = delivery_note_items.delivery_note_id
      AND dn.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete delivery note items through delivery notes"
  ON public.delivery_note_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_notes dn
      WHERE dn.id = delivery_note_items.delivery_note_id
      AND dn.user_id = auth.uid()
    )
  );

-- inventory_alerts テーブル
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory alerts"
  ON public.inventory_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory alerts"
  ON public.inventory_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory alerts"
  ON public.inventory_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory alerts"
  ON public.inventory_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- トリガー
-- ================================================

-- updated_at の自動更新
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_notes_updated_at
  BEFORE UPDATE ON public.delivery_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_alerts_updated_at
  BEFORE UPDATE ON public.inventory_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- 在庫更新時のアラート自動生成関数
-- ================================================
CREATE OR REPLACE FUNCTION public.check_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- 在庫が発注点を下回った場合、アラートを作成
  IF NEW.stock_quantity <= NEW.reorder_point AND NEW.is_inventory_managed = true THEN
    -- 既存のアクティブなアラートがなければ作成
    INSERT INTO public.inventory_alerts (
      user_id, company_id, product_id, alert_type,
      threshold_value, current_value, status
    )
    SELECT 
      NEW.user_id, NEW.company_id, NEW.id,
      CASE WHEN NEW.stock_quantity = 0 THEN 'out_of_stock' ELSE 'low_stock' END,
      NEW.reorder_point, NEW.stock_quantity, 'active'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.inventory_alerts ia
      WHERE ia.product_id = NEW.id
      AND ia.status = 'active'
      AND ia.alert_type IN ('low_stock', 'out_of_stock')
    );
  -- 在庫が発注点を上回った場合、アラートを解決済みに
  ELSIF NEW.stock_quantity > NEW.reorder_point THEN
    UPDATE public.inventory_alerts
    SET status = 'resolved', resolved_at = now(), updated_at = now()
    WHERE product_id = NEW.id
    AND status = 'active'
    AND alert_type IN ('low_stock', 'out_of_stock');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_inventory_alerts_trigger
  AFTER UPDATE OF stock_quantity ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_inventory_alerts();

-- ================================================
-- SKU自動生成関数
-- ================================================
CREATE OR REPLACE FUNCTION public.generate_product_sku(p_user_id uuid, p_category text DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_count INTEGER;
  v_sku TEXT;
BEGIN
  -- カテゴリに基づいてプレフィックスを決定
  CASE p_category
    WHEN 'サービス' THEN v_prefix := 'SVC';
    WHEN 'ハードウェア' THEN v_prefix := 'HW';
    WHEN 'ソフトウェア' THEN v_prefix := 'SW';
    WHEN '医薬品' THEN v_prefix := 'MED';
    WHEN '医療材料' THEN v_prefix := 'MAT';
    WHEN '消耗品' THEN v_prefix := 'CON';
    ELSE v_prefix := 'PRD';
  END CASE;
  
  -- ユーザーの商品数をカウント
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.products
  WHERE user_id = p_user_id;
  
  v_sku := v_prefix || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_sku;
END;
$$ LANGUAGE plpgsql SET search_path = public;