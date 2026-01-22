-- =====================================================
-- Phase 1: Industry Templates Database Foundation (Fixed)
-- =====================================================

-- 1. Create industry_templates table (Master table for 28 industries)
CREATE TABLE IF NOT EXISTS public.industry_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  description text,
  category text NOT NULL CHECK (category IN ('retail', 'service', 'professional', 'healthcare', 'construction', 'it', 'logistics', 'education')),
  icon text,
  color text,
  hero_image_url text,
  keywords text[],
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create template_accounts table (Industry-specific chart of accounts)
CREATE TABLE IF NOT EXISTS public.template_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.industry_templates(id) ON DELETE CASCADE,
  account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_code text,
  is_common boolean DEFAULT false,
  account_description text,
  tax_category text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Create template_menu_config table (Industry-specific menu settings)
CREATE TABLE IF NOT EXISTS public.template_menu_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.industry_templates(id) ON DELETE CASCADE,
  menu_groups jsonb NOT NULL DEFAULT '[]'::jsonb,
  mobile_nav_items jsonb DEFAULT '[]'::jsonb,
  hidden_features text[] DEFAULT '{}',
  emphasized_features text[] DEFAULT '{}',
  dashboard_widgets jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create template_sample_data table (Industry-specific sample data)
CREATE TABLE IF NOT EXISTS public.template_sample_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.industry_templates(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. Create template_landing_content table (LP content for each industry)
CREATE TABLE IF NOT EXISTS public.template_landing_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.industry_templates(id) ON DELETE CASCADE,
  hero_title text NOT NULL,
  hero_subtitle text,
  pain_points jsonb DEFAULT '[]'::jsonb,
  solutions jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  testimonials jsonb DEFAULT '[]'::jsonb,
  faq jsonb DEFAULT '[]'::jsonb,
  cta_text text DEFAULT 'この業種で始める',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Add template_id to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.industry_templates(id),
ADD COLUMN IF NOT EXISTS template_applied_at timestamptz;

-- 7. Create indexes for performance
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_templates' AND column_name = 'template_key' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_industry_templates_key ON public.industry_templates(template_key); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_templates' AND column_name = 'category' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_industry_templates_category ON public.industry_templates(category); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_templates' AND column_name = 'is_active' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_industry_templates_active ON public.industry_templates(is_active); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_accounts' AND column_name = 'template_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_template_accounts_template ON public.template_accounts(template_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_accounts' AND column_name = 'is_common' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_template_accounts_common ON public.template_accounts(is_common); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_menu_config' AND column_name = 'template_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_template_menu_config_template ON public.template_menu_config(template_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_landing_content' AND column_name = 'template_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_template_landing_content_template ON public.template_landing_content(template_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'template_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_companies_template ON public.companies(template_id); END IF; END $$;

-- 8. Enable RLS
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_menu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_sample_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_landing_content ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies - Templates are publicly readable
CREATE POLICY "Industry templates are publicly readable"
ON public.industry_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Template accounts are publicly readable"
ON public.template_accounts FOR SELECT
USING (true);

CREATE POLICY "Template menu config is publicly readable"
ON public.template_menu_config FOR SELECT
USING (true);

CREATE POLICY "Template sample data is publicly readable"
ON public.template_sample_data FOR SELECT
USING (is_active = true);

CREATE POLICY "Template landing content is publicly readable"
ON public.template_landing_content FOR SELECT
USING (true);

-- 10. Insert 28 industry templates
INSERT INTO public.industry_templates (template_key, name, name_en, description, category, icon, color, is_featured, sort_order) VALUES
-- Category A: Retail/Distribution (3)
('retail', '小売・EC', 'Retail & E-commerce', '店舗販売やオンラインショップ向けの在庫管理・販売管理に最適化', 'retail', 'ShoppingCart', '#3B82F6', true, 1),
('car-dealer', '自動車販売・整備', 'Car Dealer & Repair', '自動車ディーラー・整備工場向けの車両・部品管理に対応', 'retail', 'Car', '#6366F1', false, 2),
('pet-service', 'ペットサービス', 'Pet Services', 'ペットショップ・サロン・ホテル向けの顧客・予約管理', 'retail', 'Dog', '#EC4899', false, 3),

-- Category B: Food/Service (5)
('restaurant', '飲食店', 'Restaurant', '飲食店向けの食材仕入・売上管理・シフト管理に最適化', 'service', 'UtensilsCrossed', '#F59E0B', true, 4),
('beauty-salon', '美容室・サロン', 'Beauty Salon', '美容室・エステ・ネイルサロン向けの予約・顧客管理', 'service', 'Scissors', '#EC4899', true, 5),
('fitness', 'フィットネス・ジム', 'Fitness & Gym', 'ジム・スポーツ施設向けの会員管理・スケジュール管理', 'service', 'Dumbbell', '#10B981', false, 6),
('hotel', 'ホテル・旅館', 'Hotel & Inn', '宿泊施設向けの予約・客室・売上管理', 'service', 'Building2', '#8B5CF6', false, 7),
('cleaning', '清掃サービス', 'Cleaning Service', '清掃業向けのスケジュール・スタッフ・顧客管理', 'service', 'Sparkles', '#06B6D4', false, 8),

-- Category C: Professional Services (7)
('consulting', 'コンサルティング', 'Consulting', 'コンサルティング会社向けの案件・タイムトラッキング管理', 'professional', 'Briefcase', '#3B82F6', true, 9),
('legal', '法律事務所', 'Law Firm', '弁護士・法律事務所向けの案件・書類・請求管理', 'professional', 'Scale', '#1E3A8A', true, 10),
('tax-accountant', '税理士事務所', 'Tax Accountant', '税理士・会計事務所向けの顧問先・申告業務管理', 'professional', 'Calculator', '#059669', true, 11),
('patent', '特許事務所', 'Patent Office', '弁理士・特許事務所向けの出願・期限管理', 'professional', 'FileCheck', '#7C3AED', false, 12),
('real-estate', '不動産', 'Real Estate', '不動産業向けの物件・契約・顧客管理', 'professional', 'Home', '#F97316', true, 13),
('insurance', '保険代理店', 'Insurance Agency', '保険代理店向けの契約・顧客・手数料管理', 'professional', 'Shield', '#0891B2', false, 14),
('design', 'デザイン事務所', 'Design Studio', 'デザイン・クリエイティブ事務所向けのプロジェクト管理', 'professional', 'Palette', '#E11D48', false, 15),

-- Category D: Healthcare/Welfare (3)
('healthcare', '医療・クリニック', 'Healthcare & Clinic', 'クリニック・医院向けの診療・請求・患者管理', 'healthcare', 'Stethoscope', '#10B981', true, 16),
('nursery', '保育園・幼稚園', 'Nursery & Kindergarten', '保育施設向けの園児・保護者・職員管理', 'healthcare', 'Baby', '#F472B6', false, 17),
('welfare', '介護・福祉施設', 'Elderly Care & Welfare', '介護施設向けの利用者・介護記録・請求管理', 'healthcare', 'HeartHandshake', '#14B8A6', false, 18),

-- Category E: Construction/Manufacturing (4)
('construction', '建設・工事', 'Construction', '建設業向けの工事原価・外注・進捗管理', 'construction', 'HardHat', '#F59E0B', true, 19),
('manufacturing', '製造業', 'Manufacturing', '製造業向けの生産・在庫・原価管理', 'construction', 'Factory', '#6366F1', true, 20),
('food-manufacturing', '食品製造', 'Food Manufacturing', '食品工場向けの原材料・ロット・衛生管理', 'construction', 'Cookie', '#84CC16', false, 21),
('printing', '印刷業', 'Printing', '印刷会社向けの受注・工程・資材管理', 'construction', 'Printer', '#64748B', false, 22),

-- Category F: IT/Creative (3)
('it', 'IT・ソフトウェア', 'IT & Software', 'IT企業向けの開発・プロジェクト・ライセンス管理', 'it', 'Code', '#3B82F6', true, 23),
('production', '制作会社', 'Production Company', '映像・広告制作会社向けのプロジェクト・予算管理', 'it', 'Video', '#A855F7', false, 24),
('accounting-firm', '会計事務所', 'Accounting Firm', '会計事務所向けの顧問先・決算・申告管理', 'it', 'FileSpreadsheet', '#059669', false, 25),

-- Category G: Logistics/Agriculture (2)
('logistics', '物流・運送', 'Logistics & Transport', '運送業向けの配送・車両・ドライバー管理', 'logistics', 'Truck', '#0EA5E9', true, 26),
('agriculture', '農業・漁業', 'Agriculture & Fishery', '農業・漁業向けの生産・出荷・在庫管理', 'logistics', 'Leaf', '#22C55E', false, 27),

-- Category H: Education/Non-profit (1)
('education', '学習塾・教育', 'Education & Tutoring', '学習塾・スクール向けの生徒・授業・月謝管理', 'education', 'GraduationCap', '#8B5CF6', true, 28);

-- 11. Insert common accounts (shared across all industries)
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, is_common, sort_order) VALUES
(NULL, '1000', '現金', 'asset', true, 1),
(NULL, '1100', '普通預金', 'asset', true, 2),
(NULL, '1110', '当座預金', 'asset', true, 3),
(NULL, '1200', '売掛金', 'asset', true, 4),
(NULL, '1300', '前払費用', 'asset', true, 5),
(NULL, '2000', '買掛金', 'liability', true, 6),
(NULL, '2100', '未払金', 'liability', true, 7),
(NULL, '2200', '未払費用', 'liability', true, 8),
(NULL, '2300', '預り金', 'liability', true, 9),
(NULL, '2400', '仮受金', 'liability', true, 10),
(NULL, '3000', '資本金', 'equity', true, 11),
(NULL, '3100', '繰越利益剰余金', 'equity', true, 12),
(NULL, '4000', '売上高', 'revenue', true, 13),
(NULL, '5000', '仕入高', 'expense', true, 14),
(NULL, '6000', '給与手当', 'expense', true, 15),
(NULL, '6100', '法定福利費', 'expense', true, 16),
(NULL, '6200', '福利厚生費', 'expense', true, 17),
(NULL, '6300', '旅費交通費', 'expense', true, 18),
(NULL, '6400', '通信費', 'expense', true, 19),
(NULL, '6500', '消耗品費', 'expense', true, 20),
(NULL, '6600', '水道光熱費', 'expense', true, 21),
(NULL, '6700', '地代家賃', 'expense', true, 22),
(NULL, '6800', '保険料', 'expense', true, 23),
(NULL, '6900', '租税公課', 'expense', true, 24),
(NULL, '7000', '減価償却費', 'expense', true, 25),
(NULL, '7100', '支払利息', 'expense', true, 26),
(NULL, '7200', '雑費', 'expense', true, 27);

-- 12. Insert industry-specific accounts for Retail
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '5100', '商品仕入高', 'expense', '商品の仕入れ', 101 FROM public.industry_templates WHERE template_key = 'retail'
UNION ALL SELECT id, '5200', '送料・配送費', 'expense', '配送にかかる費用', 102 FROM public.industry_templates WHERE template_key = 'retail'
UNION ALL SELECT id, '6950', 'EC手数料', 'expense', 'ECモール手数料', 103 FROM public.industry_templates WHERE template_key = 'retail'
UNION ALL SELECT id, '1450', '商品', 'asset', '在庫商品', 104 FROM public.industry_templates WHERE template_key = 'retail'
UNION ALL SELECT id, '4050', '送料収入', 'revenue', '顧客からの送料', 105 FROM public.industry_templates WHERE template_key = 'retail';

-- Beauty Salon
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '技術売上', 'revenue', 'カット・カラー等の技術料', 101 FROM public.industry_templates WHERE template_key = 'beauty-salon'
UNION ALL SELECT id, '4020', '店販売上', 'revenue', 'シャンプー等の商品販売', 102 FROM public.industry_templates WHERE template_key = 'beauty-salon'
UNION ALL SELECT id, '4030', '指名料', 'revenue', 'スタイリスト指名料', 103 FROM public.industry_templates WHERE template_key = 'beauty-salon'
UNION ALL SELECT id, '5010', '材料費', 'expense', 'カラー剤・パーマ液等', 104 FROM public.industry_templates WHERE template_key = 'beauty-salon'
UNION ALL SELECT id, '6350', '講習費', 'expense', '技術講習費用', 105 FROM public.industry_templates WHERE template_key = 'beauty-salon';

-- Restaurant
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '5050', '食材仕入', 'expense', '食材の仕入れ', 101 FROM public.industry_templates WHERE template_key = 'restaurant'
UNION ALL SELECT id, '5060', '飲料仕入', 'expense', 'ドリンク類の仕入れ', 102 FROM public.industry_templates WHERE template_key = 'restaurant'
UNION ALL SELECT id, '6650', 'ガス代', 'expense', '調理用ガス', 103 FROM public.industry_templates WHERE template_key = 'restaurant'
UNION ALL SELECT id, '6660', '厨房消耗品', 'expense', '使い捨て容器等', 104 FROM public.industry_templates WHERE template_key = 'restaurant'
UNION ALL SELECT id, '4010', 'フード売上', 'revenue', '料理の売上', 105 FROM public.industry_templates WHERE template_key = 'restaurant'
UNION ALL SELECT id, '4020', 'ドリンク売上', 'revenue', '飲料の売上', 106 FROM public.industry_templates WHERE template_key = 'restaurant';

-- Legal
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '着手金', 'revenue', '案件着手時の報酬', 101 FROM public.industry_templates WHERE template_key = 'legal'
UNION ALL SELECT id, '4020', '成功報酬', 'revenue', '案件成功時の報酬', 102 FROM public.industry_templates WHERE template_key = 'legal'
UNION ALL SELECT id, '4030', 'タイムチャージ', 'revenue', '時間制報酬', 103 FROM public.industry_templates WHERE template_key = 'legal'
UNION ALL SELECT id, '4040', '顧問料', 'revenue', '顧問契約報酬', 104 FROM public.industry_templates WHERE template_key = 'legal'
UNION ALL SELECT id, '6250', '印紙代', 'expense', '収入印紙', 105 FROM public.industry_templates WHERE template_key = 'legal'
UNION ALL SELECT id, '6260', '裁判所納付金', 'expense', '訴訟費用', 106 FROM public.industry_templates WHERE template_key = 'legal';

-- Real Estate
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '仲介手数料', 'revenue', '売買・賃貸仲介手数料', 101 FROM public.industry_templates WHERE template_key = 'real-estate'
UNION ALL SELECT id, '4020', '管理料収入', 'revenue', '物件管理報酬', 102 FROM public.industry_templates WHERE template_key = 'real-estate'
UNION ALL SELECT id, '4030', '礼金収入', 'revenue', '賃貸契約時の礼金', 103 FROM public.industry_templates WHERE template_key = 'real-estate'
UNION ALL SELECT id, '6350', '広告宣伝費', 'expense', '物件広告費用', 104 FROM public.industry_templates WHERE template_key = 'real-estate'
UNION ALL SELECT id, '6950', 'ポータルサイト掲載料', 'expense', 'SUUMO等の掲載費', 105 FROM public.industry_templates WHERE template_key = 'real-estate';

-- Healthcare
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '保険診療収入', 'revenue', '健康保険適用の診療', 101 FROM public.industry_templates WHERE template_key = 'healthcare'
UNION ALL SELECT id, '4020', '自由診療収入', 'revenue', '自費診療', 102 FROM public.industry_templates WHERE template_key = 'healthcare'
UNION ALL SELECT id, '5010', '医薬品仕入', 'expense', '薬剤の仕入れ', 103 FROM public.industry_templates WHERE template_key = 'healthcare'
UNION ALL SELECT id, '5020', '医療材料費', 'expense', '診療材料', 104 FROM public.industry_templates WHERE template_key = 'healthcare'
UNION ALL SELECT id, '6350', '医療機器リース料', 'expense', '機器リース', 105 FROM public.industry_templates WHERE template_key = 'healthcare';

-- Construction
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '工事収入', 'revenue', '工事請負収入', 101 FROM public.industry_templates WHERE template_key = 'construction'
UNION ALL SELECT id, '5010', '材料費', 'expense', '建設資材', 102 FROM public.industry_templates WHERE template_key = 'construction'
UNION ALL SELECT id, '5020', '外注費', 'expense', '協力会社への支払', 103 FROM public.industry_templates WHERE template_key = 'construction'
UNION ALL SELECT id, '5030', '重機リース料', 'expense', '建機レンタル', 104 FROM public.industry_templates WHERE template_key = 'construction'
UNION ALL SELECT id, '5040', '労務費', 'expense', '現場作業員人件費', 105 FROM public.industry_templates WHERE template_key = 'construction';

-- Manufacturing
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '製品売上', 'revenue', '製品販売収入', 101 FROM public.industry_templates WHERE template_key = 'manufacturing'
UNION ALL SELECT id, '5010', '原材料費', 'expense', '製造用原材料', 102 FROM public.industry_templates WHERE template_key = 'manufacturing'
UNION ALL SELECT id, '5020', '労務費', 'expense', '製造部門人件費', 103 FROM public.industry_templates WHERE template_key = 'manufacturing'
UNION ALL SELECT id, '5030', '製造経費', 'expense', '工場運営費', 104 FROM public.industry_templates WHERE template_key = 'manufacturing'
UNION ALL SELECT id, '1500', '製品', 'asset', '完成品在庫', 105 FROM public.industry_templates WHERE template_key = 'manufacturing'
UNION ALL SELECT id, '1510', '仕掛品', 'asset', '製造中の製品', 106 FROM public.industry_templates WHERE template_key = 'manufacturing';

-- IT/Software
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '開発売上', 'revenue', 'システム開発収入', 101 FROM public.industry_templates WHERE template_key = 'it'
UNION ALL SELECT id, '4020', 'ライセンス収入', 'revenue', 'ソフトウェアライセンス', 102 FROM public.industry_templates WHERE template_key = 'it'
UNION ALL SELECT id, '4030', '保守売上', 'revenue', '保守・サポート収入', 103 FROM public.industry_templates WHERE template_key = 'it'
UNION ALL SELECT id, '6350', 'サーバー費', 'expense', 'クラウドサーバー費用', 104 FROM public.industry_templates WHERE template_key = 'it'
UNION ALL SELECT id, '6360', 'ツール利用料', 'expense', '開発ツール費用', 105 FROM public.industry_templates WHERE template_key = 'it';

-- Logistics
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '運送収入', 'revenue', '運送料収入', 101 FROM public.industry_templates WHERE template_key = 'logistics'
UNION ALL SELECT id, '4020', '倉庫保管料', 'revenue', '倉庫利用料', 102 FROM public.industry_templates WHERE template_key = 'logistics'
UNION ALL SELECT id, '5010', '燃料費', 'expense', '車両燃料費', 103 FROM public.industry_templates WHERE template_key = 'logistics'
UNION ALL SELECT id, '5020', '高速道路代', 'expense', '高速料金', 104 FROM public.industry_templates WHERE template_key = 'logistics'
UNION ALL SELECT id, '6350', '車両修繕費', 'expense', '車両メンテナンス', 105 FROM public.industry_templates WHERE template_key = 'logistics';

-- Consulting
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '顧問料収入', 'revenue', '顧問契約報酬', 101 FROM public.industry_templates WHERE template_key = 'consulting'
UNION ALL SELECT id, '4020', 'コンサルティング収入', 'revenue', 'プロジェクト報酬', 102 FROM public.industry_templates WHERE template_key = 'consulting'
UNION ALL SELECT id, '4030', '講演料', 'revenue', 'セミナー・講演収入', 103 FROM public.industry_templates WHERE template_key = 'consulting'
UNION ALL SELECT id, '6350', '出張旅費', 'expense', '出張費用', 104 FROM public.industry_templates WHERE template_key = 'consulting'
UNION ALL SELECT id, '6360', 'セミナー会場費', 'expense', '会場レンタル', 105 FROM public.industry_templates WHERE template_key = 'consulting';

-- Tax Accountant
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '顧問料', 'revenue', '月額顧問報酬', 101 FROM public.industry_templates WHERE template_key = 'tax-accountant'
UNION ALL SELECT id, '4020', '決算報酬', 'revenue', '決算業務報酬', 102 FROM public.industry_templates WHERE template_key = 'tax-accountant'
UNION ALL SELECT id, '4030', '税務申告報酬', 'revenue', '申告書作成報酬', 103 FROM public.industry_templates WHERE template_key = 'tax-accountant'
UNION ALL SELECT id, '4040', '記帳代行料', 'revenue', '記帳代行報酬', 104 FROM public.industry_templates WHERE template_key = 'tax-accountant'
UNION ALL SELECT id, '6350', '会計ソフト利用料', 'expense', '会計システム費用', 105 FROM public.industry_templates WHERE template_key = 'tax-accountant';

-- Education
INSERT INTO public.template_accounts (template_id, account_code, account_name, account_type, account_description, sort_order)
SELECT id, '4010', '授業料収入', 'revenue', '月謝・授業料', 101 FROM public.industry_templates WHERE template_key = 'education'
UNION ALL SELECT id, '4020', '入会金収入', 'revenue', '入塾金', 102 FROM public.industry_templates WHERE template_key = 'education'
UNION ALL SELECT id, '4030', '教材売上', 'revenue', 'テキスト販売', 103 FROM public.industry_templates WHERE template_key = 'education'
UNION ALL SELECT id, '5010', '教材仕入', 'expense', 'テキスト仕入', 104 FROM public.industry_templates WHERE template_key = 'education'
UNION ALL SELECT id, '6350', '講師報酬', 'expense', '非常勤講師費用', 105 FROM public.industry_templates WHERE template_key = 'education';

-- 13. Insert menu configurations for each template
INSERT INTO public.template_menu_config (template_id, menu_groups, hidden_features, emphasized_features, dashboard_widgets)
SELECT it.id, t.menu_groups::jsonb, t.hidden_features, t.emphasized_features, t.dashboard_widgets::jsonb
FROM public.industry_templates it
JOIN (VALUES
  ('retail', 
   '[{"id":"sales","priority":1},{"id":"inventory","priority":2},{"id":"purchasing","priority":3}]',
   ARRAY['contracts', 'recruiting', 'wiki'],
   ARRAY['products', 'auto-reorder', 'delivery-notes'],
   '[{"type":"inventory-alerts","position":1},{"type":"revenue-chart","position":2},{"type":"top-products","position":3}]'),
  ('beauty-salon',
   '[{"id":"crm","priority":1},{"id":"hr","priority":2},{"id":"sales","priority":3}]',
   ARRAY['inventory', 'purchasing', 'projects'],
   ARRAY['clients', 'attendance', 'invoices'],
   '[{"type":"today-appointments","position":1},{"type":"revenue-chart","position":2},{"type":"repeat-rate","position":3}]'),
  ('restaurant',
   '[{"id":"hr","priority":1},{"id":"expenses","priority":2},{"id":"sales","priority":3}]',
   ARRAY['contracts', 'projects', 'crm'],
   ARRAY['attendance', 'receipt-capture', 'expenses'],
   '[{"type":"daily-sales","position":1},{"type":"food-cost-ratio","position":2},{"type":"shift-summary","position":3}]'),
  ('consulting',
   '[{"id":"crm","priority":1},{"id":"contracts","priority":2},{"id":"projects","priority":3}]',
   ARRAY['inventory', 'purchasing', 'manufacturing'],
   ARRAY['deals', 'contracts', 'timelog'],
   '[{"type":"pipeline-overview","position":1},{"type":"billable-hours","position":2},{"type":"revenue-chart","position":3}]'),
  ('legal',
   '[{"id":"contracts","priority":1},{"id":"crm","priority":2},{"id":"sales","priority":3}]',
   ARRAY['inventory', 'purchasing', 'manufacturing'],
   ARRAY['contracts', 'clients', 'timelog'],
   '[{"type":"active-cases","position":1},{"type":"billable-hours","position":2},{"type":"upcoming-deadlines","position":3}]'),
  ('healthcare',
   '[{"id":"sales","priority":1},{"id":"hr","priority":2},{"id":"expenses","priority":3}]',
   ARRAY['contracts', 'projects', 'crm'],
   ARRAY['invoices', 'employees', 'expenses'],
   '[{"type":"daily-patients","position":1},{"type":"revenue-chart","position":2},{"type":"insurance-claims","position":3}]'),
  ('construction',
   '[{"id":"projects","priority":1},{"id":"expenses","priority":2},{"id":"hr","priority":3}]',
   ARRAY['crm', 'wiki']::text[],
   ARRAY['projects', 'expenses', 'employees'],
   '[{"type":"active-projects","position":1},{"type":"project-costs","position":2},{"type":"worker-allocation","position":3}]'),
  ('manufacturing',
   '[{"id":"inventory","priority":1},{"id":"purchasing","priority":2},{"id":"sales","priority":3}]',
   ARRAY['crm', 'contracts', 'wiki'],
   ARRAY['products', 'purchase-orders', 'delivery-notes'],
   '[{"type":"inventory-alerts","position":1},{"type":"production-status","position":2},{"type":"order-fulfillment","position":3}]'),
  ('it',
   '[{"id":"projects","priority":1},{"id":"crm","priority":2},{"id":"hr","priority":3}]',
   ARRAY['inventory', 'purchasing']::text[],
   ARRAY['projects', 'timelog', 'wiki'],
   '[{"type":"sprint-progress","position":1},{"type":"team-velocity","position":2},{"type":"revenue-chart","position":3}]'),
  ('logistics',
   '[{"id":"hr","priority":1},{"id":"expenses","priority":2},{"id":"sales","priority":3}]',
   ARRAY['crm', 'contracts', 'wiki', 'projects'],
   ARRAY['attendance', 'expenses', 'employees'],
   '[{"type":"deliveries-today","position":1},{"type":"fuel-consumption","position":2},{"type":"driver-status","position":3}]'),
  ('real-estate',
   '[{"id":"crm","priority":1},{"id":"contracts","priority":2},{"id":"sales","priority":3}]',
   ARRAY['inventory', 'purchasing', 'projects'],
   ARRAY['clients', 'contracts', 'deals'],
   '[{"type":"active-listings","position":1},{"type":"deals-pipeline","position":2},{"type":"commission-summary","position":3}]'),
  ('education',
   '[{"id":"crm","priority":1},{"id":"sales","priority":2},{"id":"hr","priority":3}]',
   ARRAY['inventory', 'purchasing', 'contracts'],
   ARRAY['clients', 'invoices', 'attendance'],
   '[{"type":"student-count","position":1},{"type":"class-schedule","position":2},{"type":"monthly-revenue","position":3}]'),
  ('tax-accountant',
   '[{"id":"crm","priority":1},{"id":"sales","priority":2},{"id":"accounting","priority":3}]',
   ARRAY['inventory', 'purchasing', 'projects'],
   ARRAY['clients', 'invoices', 'accounting'],
   '[{"type":"client-deadlines","position":1},{"type":"monthly-revenue","position":2},{"type":"task-summary","position":3}]')
) AS t(template_key, menu_groups, hidden_features, emphasized_features, dashboard_widgets)
ON it.template_key = t.template_key;

-- 14. Insert landing page content for featured templates
INSERT INTO public.template_landing_content (template_id, hero_title, hero_subtitle, pain_points, solutions, features, cta_text)
SELECT it.id, t.hero_title, t.hero_subtitle, t.pain_points::jsonb, t.solutions::jsonb, t.features::jsonb, t.cta_text
FROM public.industry_templates it
JOIN (VALUES
  ('retail', 
   '小売・EC事業者のための統合業務管理',
   '在庫管理から売上分析まで、すべてを一元管理',
   '[{"title":"在庫切れ・過剰在庫","description":"手動管理による在庫の最適化が困難"},{"title":"複数チャネル管理","description":"実店舗とECの在庫を別々に管理"},{"title":"売上分析の手間","description":"データ集計に時間がかかる"}]',
   '[{"title":"自動発注アラート","description":"在庫が設定値を下回ると自動通知"},{"title":"統合在庫管理","description":"全チャネルの在庫を一元管理"},{"title":"リアルタイム分析","description":"売上・在庫をダッシュボードで可視化"}]',
   '[{"title":"在庫管理","description":"バーコードスキャン対応の在庫管理","icon":"Package"},{"title":"自動発注","description":"発注点を設定して自動アラート","icon":"RefreshCw"},{"title":"売上分析","description":"商品別・期間別の売上レポート","icon":"BarChart"}]',
   '小売・ECで始める'),
  ('beauty-salon',
   '美容室・サロン専用の顧客管理システム',
   '予約から売上まで、サロン経営を効率化',
   '[{"title":"予約管理の煩雑さ","description":"電話・LINE・Web予約の一元管理が困難"},{"title":"顧客情報の分散","description":"施術履歴やカルテが整理されていない"},{"title":"スタッフシフト調整","description":"シフト作成に時間がかかる"}]',
   '[{"title":"統合予約管理","description":"全チャネルの予約を一元管理"},{"title":"電子カルテ","description":"施術履歴を顧客ごとに記録"},{"title":"シフト自動作成","description":"予約状況に応じたシフト提案"}]',
   '[{"title":"顧客管理","description":"施術履歴・好みを記録","icon":"Users"},{"title":"売上分析","description":"スタイリスト別の売上把握","icon":"BarChart"},{"title":"シフト管理","description":"簡単シフト作成","icon":"Calendar"}]',
   '美容室・サロンで始める'),
  ('restaurant',
   '飲食店経営をスマートに',
   '食材管理からシフトまで、店舗運営を効率化',
   '[{"title":"食材ロスの発生","description":"在庫管理が不十分で廃棄が多い"},{"title":"シフト調整の手間","description":"スタッフの希望調整に時間がかかる"},{"title":"売上把握の遅れ","description":"日次売上の集計が翌日以降"}]',
   '[{"title":"在庫アラート","description":"食材の消費期限・在庫量を管理"},{"title":"シフト管理","description":"スタッフの希望を考慮したシフト作成"},{"title":"リアルタイム売上","description":"POSレス売上入力と即時集計"}]',
   '[{"title":"食材管理","description":"仕入れ・在庫・ロスを管理","icon":"UtensilsCrossed"},{"title":"シフト管理","description":"希望シフト収集と自動作成","icon":"Calendar"},{"title":"売上分析","description":"時間帯別・メニュー別分析","icon":"BarChart"}]',
   '飲食店で始める'),
  ('consulting',
   'コンサルティング会社のための案件管理',
   '商談から請求まで、プロジェクトを一気通貫で管理',
   '[{"title":"案件進捗の見える化","description":"複数プロジェクトの状況把握が困難"},{"title":"稼働時間の集計","description":"タイムシートの集計に手間"},{"title":"請求漏れ","description":"作業時間と請求の紐付けミス"}]',
   '[{"title":"パイプライン管理","description":"商談から受注までを可視化"},{"title":"タイムトラッキング","description":"プロジェクト別の稼働時間を自動集計"},{"title":"自動請求作成","description":"稼働時間から請求書を自動生成"}]',
   '[{"title":"CRM","description":"商談・顧客を一元管理","icon":"Users"},{"title":"タイムログ","description":"稼働時間を記録・集計","icon":"Clock"},{"title":"請求管理","description":"プロジェクト別請求書作成","icon":"FileText"}]',
   'コンサルで始める'),
  ('construction',
   '建設業のための工事原価管理',
   '現場ごとの収支を見える化',
   '[{"title":"工事原価の把握困難","description":"現場ごとの収支が不明確"},{"title":"外注管理の煩雑さ","description":"協力会社への発注・支払管理"},{"title":"進捗報告の遅れ","description":"現場状況のリアルタイム把握"}]',
   '[{"title":"原価管理","description":"材料費・外注費・労務費を現場別集計"},{"title":"外注管理","description":"協力会社への発注から支払まで管理"},{"title":"進捗管理","description":"現場写真・日報でリアルタイム共有"}]',
   '[{"title":"工事台帳","description":"現場別の収支を管理","icon":"HardHat"},{"title":"外注管理","description":"協力会社への発注管理","icon":"Users"},{"title":"進捗報告","description":"現場状況を共有","icon":"Camera"}]',
   '建設業で始める'),
  ('legal',
   '法律事務所のための案件・請求管理',
   'タイムチャージから請求書作成まで一元管理',
   '[{"title":"案件管理の複雑さ","description":"複数案件の進捗・期限管理が困難"},{"title":"タイムチャージ集計","description":"稼働時間の記録・集計に手間"},{"title":"書類管理","description":"契約書・書面の整理が煩雑"}]',
   '[{"title":"案件管理","description":"案件ごとの進捗・期限を一元管理"},{"title":"タイムトラッキング","description":"弁護士別の稼働時間を自動集計"},{"title":"電子署名","description":"契約書の電子署名・管理"}]',
   '[{"title":"案件管理","description":"訴訟・顧問案件を管理","icon":"Scale"},{"title":"タイムログ","description":"稼働時間を記録","icon":"Clock"},{"title":"請求書","description":"タイムチャージから自動生成","icon":"FileText"}]',
   '法律事務所で始める'),
  ('healthcare',
   '医療・クリニック向け経営管理システム',
   '診療から請求まで、クリニック経営を効率化',
   '[{"title":"レセプト管理","description":"保険請求の処理に時間がかかる"},{"title":"患者情報管理","description":"カルテ・予約の一元管理が困難"},{"title":"経費管理","description":"医薬品・材料の在庫把握"}]',
   '[{"title":"患者管理","description":"予約・診療履歴を一元管理"},{"title":"請求管理","description":"保険診療・自由診療の請求を効率化"},{"title":"在庫管理","description":"医薬品・材料の在庫をリアルタイム把握"}]',
   '[{"title":"患者管理","description":"診療履歴を記録","icon":"Stethoscope"},{"title":"請求管理","description":"保険・自費の請求書作成","icon":"FileText"},{"title":"在庫管理","description":"医薬品の在庫管理","icon":"Package"}]',
   '医療・クリニックで始める'),
  ('manufacturing',
   '製造業のための生産・原価管理',
   '原材料から製品出荷まで一気通貫で管理',
   '[{"title":"原価把握の困難","description":"製品ごとの原価計算が複雑"},{"title":"在庫管理","description":"原材料・製品の在庫把握"},{"title":"生産計画","description":"受注と生産のバランス調整"}]',
   '[{"title":"原価計算","description":"材料費・労務費・経費を自動集計"},{"title":"在庫一元管理","description":"原材料・仕掛品・製品を統合管理"},{"title":"生産管理","description":"受注に基づく生産計画立案"}]',
   '[{"title":"原価管理","description":"製品別原価を自動計算","icon":"Calculator"},{"title":"在庫管理","description":"材料・製品を一元管理","icon":"Package"},{"title":"発注管理","description":"材料の自動発注アラート","icon":"RefreshCw"}]',
   '製造業で始める'),
  ('it',
   'IT企業のためのプロジェクト管理',
   '開発から請求まで、IT事業を効率化',
   '[{"title":"プロジェクト進捗","description":"複数案件の進捗管理が困難"},{"title":"工数管理","description":"メンバーの稼働時間把握"},{"title":"請求管理","description":"プロジェクト別の請求漏れ"}]',
   '[{"title":"プロジェクト管理","description":"タスク・進捗を一元管理"},{"title":"タイムトラッキング","description":"メンバー別の工数を自動集計"},{"title":"自動請求","description":"工数から請求書を自動生成"}]',
   '[{"title":"プロジェクト","description":"タスク・進捗を管理","icon":"Code"},{"title":"タイムログ","description":"工数を記録・分析","icon":"Clock"},{"title":"Wiki","description":"ナレッジを共有","icon":"BookOpen"}]',
   'IT企業で始める'),
  ('logistics',
   '物流・運送業のための配送管理',
   '車両管理からドライバー勤怠まで一元管理',
   '[{"title":"配送管理","description":"配送状況のリアルタイム把握が困難"},{"title":"車両管理","description":"車両の稼働・メンテナンス管理"},{"title":"ドライバー管理","description":"シフト・勤怠の調整"}]',
   '[{"title":"配送追跡","description":"配送状況をリアルタイムで把握"},{"title":"車両管理","description":"車両ごとの稼働・燃費を管理"},{"title":"勤怠管理","description":"ドライバーのシフト・勤怠を一元管理"}]',
   '[{"title":"配送管理","description":"配送状況を追跡","icon":"Truck"},{"title":"車両管理","description":"車両の稼働・燃費を管理","icon":"Car"},{"title":"勤怠管理","description":"ドライバーの勤怠管理","icon":"Calendar"}]',
   '物流・運送で始める'),
  ('real-estate',
   '不動産業のための物件・顧客管理',
   '物件情報から契約まで一元管理',
   '[{"title":"物件情報管理","description":"複数の物件情報の整理が煩雑"},{"title":"顧客対応","description":"反響への迅速な対応が困難"},{"title":"契約管理","description":"契約書類の管理・追跡"}]',
   '[{"title":"物件管理","description":"物件情報を一元管理"},{"title":"CRM","description":"顧客・反響を効率的に管理"},{"title":"電子契約","description":"契約書の電子署名・管理"}]',
   '[{"title":"物件管理","description":"物件情報を一元管理","icon":"Home"},{"title":"顧客管理","description":"反響・商談を管理","icon":"Users"},{"title":"契約管理","description":"電子契約で効率化","icon":"FileText"}]',
   '不動産で始める'),
  ('education',
   '学習塾・教育機関のための生徒管理',
   '生徒情報から月謝管理まで一元化',
   '[{"title":"生徒管理","description":"生徒・保護者情報の管理が煩雑"},{"title":"月謝管理","description":"請求・入金管理に手間"},{"title":"授業スケジュール","description":"講師・教室の調整が困難"}]',
   '[{"title":"生徒管理","description":"生徒・保護者情報を一元管理"},{"title":"月謝自動請求","description":"月謝の請求・入金を自動化"},{"title":"スケジュール管理","description":"授業・講師のスケジュールを最適化"}]',
   '[{"title":"生徒管理","description":"生徒・保護者を管理","icon":"GraduationCap"},{"title":"月謝管理","description":"請求・入金を自動化","icon":"CreditCard"},{"title":"授業管理","description":"スケジュールを管理","icon":"Calendar"}]',
   '学習塾・教育で始める'),
  ('tax-accountant',
   '税理士事務所のための顧問先管理',
   '顧問先の決算・申告業務を効率化',
   '[{"title":"顧問先管理","description":"複数顧問先の情報管理が煩雑"},{"title":"期限管理","description":"申告期限の把握が困難"},{"title":"請求管理","description":"顧問料・決算報酬の請求漏れ"}]',
   '[{"title":"顧問先管理","description":"顧問先情報を一元管理"},{"title":"期限アラート","description":"申告期限を自動通知"},{"title":"自動請求","description":"顧問料・報酬を自動請求"}]',
   '[{"title":"顧問先管理","description":"顧問先を一元管理","icon":"Users"},{"title":"期限管理","description":"申告期限を管理","icon":"Calendar"},{"title":"請求管理","description":"報酬を自動請求","icon":"FileText"}]',
   '税理士事務所で始める')
) AS t(template_key, hero_title, hero_subtitle, pain_points, solutions, features, cta_text)
ON it.template_key = t.template_key;

-- 15. Create function to apply template on company creation
CREATE OR REPLACE FUNCTION public.apply_industry_template()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if template_id is set
  IF NEW.template_id IS NOT NULL THEN
    -- Copy common accounts
    INSERT INTO public.accounts (user_id, account_code, account_name, account_type, is_system)
    SELECT NEW.created_by, account_code, account_name, 
           account_type::public.account_type, true
    FROM public.template_accounts
    WHERE is_common = true
    ON CONFLICT DO NOTHING;
    
    -- Copy template-specific accounts
    INSERT INTO public.accounts (user_id, account_code, account_name, account_type, is_system)
    SELECT NEW.created_by, ta.account_code, ta.account_name,
           ta.account_type::public.account_type, true
    FROM public.template_accounts ta
    WHERE ta.template_id = NEW.template_id
    ON CONFLICT DO NOTHING;
    
    -- Mark template as applied
    NEW.template_applied_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create trigger for template application
DROP TRIGGER IF EXISTS trigger_apply_industry_template ON public.companies;
CREATE TRIGGER trigger_apply_industry_template
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_industry_template();

-- 17. Update timestamp trigger for new tables
CREATE TRIGGER update_industry_templates_updated_at
  BEFORE UPDATE ON public.industry_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_menu_config_updated_at
  BEFORE UPDATE ON public.template_menu_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_landing_content_updated_at
  BEFORE UPDATE ON public.template_landing_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();