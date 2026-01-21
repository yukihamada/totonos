-- =============================================
-- 民泊管理システム用テーブル
-- =============================================

-- 物件テーブル
CREATE TABLE public.vacation_rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  property_type TEXT NOT NULL DEFAULT 'entire_home',
  max_guests INTEGER NOT NULL DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  amenities JSONB DEFAULT '[]'::jsonb,
  registration_number TEXT,
  registration_date DATE,
  annual_limit_days INTEGER NOT NULL DEFAULT 180,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  house_rules TEXT,
  check_in_time TEXT DEFAULT '15:00',
  check_out_time TEXT DEFAULT '10:00',
  base_price DECIMAL(10, 2) DEFAULT 0,
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 予約テーブル
CREATE TABLE public.vacation_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.vacation_rentals(id) ON DELETE CASCADE,
  guest_id UUID,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  source TEXT DEFAULT 'direct',
  external_booking_id TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  special_requests JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
);

-- ゲストテーブル
CREATE TABLE public.vacation_guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_kana TEXT,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  address TEXT,
  previous_stays INTEGER DEFAULT 0,
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 清掃タスクテーブル
CREATE TABLE public.cleaning_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.vacation_rentals(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.vacation_bookings(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT DEFAULT '11:00',
  assigned_to TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  photos JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 料金設定テーブル
CREATE TABLE public.vacation_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.vacation_rentals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  price_type TEXT DEFAULT 'regular',
  min_stay INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, date)
);

-- =============================================
-- RLSポリシー
-- =============================================

ALTER TABLE public.vacation_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_pricing ENABLE ROW LEVEL SECURITY;

-- vacation_rentals policies
CREATE POLICY "Users can view own company vacation rentals"
ON public.vacation_rentals FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create vacation rentals"
ON public.vacation_rentals FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own company vacation rentals"
ON public.vacation_rentals FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can delete own company vacation rentals"
ON public.vacation_rentals FOR DELETE
USING (public.is_company_member(auth.uid(), company_id));

-- vacation_bookings policies
CREATE POLICY "Users can view own company bookings"
ON public.vacation_bookings FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create bookings"
ON public.vacation_bookings FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own company bookings"
ON public.vacation_bookings FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can delete own company bookings"
ON public.vacation_bookings FOR DELETE
USING (public.is_company_member(auth.uid(), company_id));

-- vacation_guests policies
CREATE POLICY "Users can view own company guests"
ON public.vacation_guests FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create guests"
ON public.vacation_guests FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own company guests"
ON public.vacation_guests FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can delete own company guests"
ON public.vacation_guests FOR DELETE
USING (public.is_company_member(auth.uid(), company_id));

-- cleaning_tasks policies
CREATE POLICY "Users can view own company cleaning tasks"
ON public.cleaning_tasks FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create cleaning tasks"
ON public.cleaning_tasks FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own company cleaning tasks"
ON public.cleaning_tasks FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can delete own company cleaning tasks"
ON public.cleaning_tasks FOR DELETE
USING (public.is_company_member(auth.uid(), company_id));

-- vacation_pricing policies
CREATE POLICY "Users can view own company pricing"
ON public.vacation_pricing FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create pricing"
ON public.vacation_pricing FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own company pricing"
ON public.vacation_pricing FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can delete own company pricing"
ON public.vacation_pricing FOR DELETE
USING (public.is_company_member(auth.uid(), company_id));

-- =============================================
-- トリガー
-- =============================================

CREATE TRIGGER update_vacation_rentals_updated_at
  BEFORE UPDATE ON public.vacation_rentals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacation_bookings_updated_at
  BEFORE UPDATE ON public.vacation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacation_guests_updated_at
  BEFORE UPDATE ON public.vacation_guests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cleaning_tasks_updated_at
  BEFORE UPDATE ON public.cleaning_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 営業日数計算関数
-- =============================================

CREATE OR REPLACE FUNCTION public.get_operating_days(
  p_property_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(check_out_date - check_in_date), 0)::INTEGER
  FROM public.vacation_bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'completed')
    AND EXTRACT(YEAR FROM check_in_date) = p_year
$$;

-- =============================================
-- 業種テンプレート追加
-- =============================================

INSERT INTO public.industry_templates (
  template_key, name, name_en, description, 
  category, icon, color, is_active, is_featured, sort_order, keywords
) VALUES (
  'vacation-rental',
  '民泊・バケーションレンタル',
  'Vacation Rental',
  '物件管理・予約カレンダー・清掃スケジュール・180日制限対応に最適化された民泊運営システム',
  'service',
  '🏠',
  '#FF5A5F',
  true,
  true,
  15,
  ARRAY['民泊', 'Airbnb', 'バケーションレンタル', '短期賃貸', '宿泊', 'ホスト', '清掃', '予約管理', '住宅宿泊事業']
);

-- テンプレートメニュー設定
INSERT INTO public.template_menu_config (
  template_id,
  menu_groups,
  mobile_nav_items,
  hidden_features,
  emphasized_features
)
SELECT 
  id,
  '[
    {"id": "vacation-rental", "priority": 1},
    {"id": "invoices", "priority": 2},
    {"id": "crm", "priority": 3},
    {"id": "accounting", "priority": 4}
  ]'::jsonb,
  '["vacation-dashboard", "vacation-calendar", "vacation-cleaning", "dashboard"]'::jsonb,
  ARRAY['hr', 'healthcare', 'inventory', 'recruitment', 'contracts'],
  ARRAY['vacation-rental', 'vacation-calendar', 'vacation-cleaning']
FROM public.industry_templates
WHERE template_key = 'vacation-rental';

-- テンプレートLP用コンテンツ
INSERT INTO public.template_landing_content (
  template_id,
  hero_title,
  hero_subtitle,
  pain_points,
  solutions,
  features,
  faq,
  cta_text
)
SELECT 
  id,
  '民泊運営を一元管理',
  '物件・予約・清掃・法令対応をすべてTotonos一つで。Airbnbホストから複数物件オーナーまで。',
  '[
    {"icon": "Calendar", "title": "予約管理が煩雑", "description": "複数OTAの予約を手動で転記、ダブルブッキングのリスク"},
    {"icon": "Sparkles", "title": "清掃手配に時間がかかる", "description": "チェックアウトのたびに連絡、スケジュール調整が大変"},
    {"icon": "AlertTriangle", "title": "180日制限の把握が困難", "description": "住宅宿泊事業法の営業日数上限を超えないか常に心配"}
  ]'::jsonb,
  '[
    {"icon": "LayoutDashboard", "title": "統合ダッシュボード", "description": "全物件の稼働状況・売上・タスクを一目で確認"},
    {"icon": "CalendarDays", "title": "ビジュアル予約カレンダー", "description": "物件別の予約状況をカラー表示、ドラッグで新規予約"},
    {"icon": "CheckSquare", "title": "清掃自動スケジュール", "description": "チェックアウト日に自動でタスク生成、担当者通知"}
  ]'::jsonb,
  '[
    {"icon": "Home", "title": "物件管理", "description": "写真・アメニティ・料金・届出情報を一元管理"},
    {"icon": "Calendar", "title": "予約カレンダー", "description": "月表示で空き状況確認、OTA予約のインポート対応"},
    {"icon": "Sparkles", "title": "清掃スケジュール", "description": "チェックリスト管理、完了写真のアップロード"},
    {"icon": "BarChart3", "title": "営業日数管理", "description": "年間180日制限に対応、アラート機能付き"},
    {"icon": "Users", "title": "ゲスト管理", "description": "宿泊履歴・パスポート情報・レビュー管理"},
    {"icon": "Receipt", "title": "売上レポート", "description": "物件別・月別の収益分析、稼働率グラフ"}
  ]'::jsonb,
  '[
    {"question": "Airbnbの予約を自動同期できますか？", "answer": "現在は手動インポートに対応しています。予約情報を入力する際にAirbnb等のソースを選択できます。今後iCal連携を予定しています。"},
    {"question": "複数物件を管理できますか？", "answer": "はい、物件数に制限はありません。各物件ごとに料金設定や届出情報を個別管理できます。"},
    {"question": "住宅宿泊事業法の180日制限に対応していますか？", "answer": "はい、物件ごとの年間宿泊日数を自動カウントし、制限到達前にアラートを表示します。"},
    {"question": "清掃スタッフとの連携はどうなりますか？", "answer": "清掃タスクを作成し担当者をアサインできます。チェックリストの進捗管理や完了写真のアップロードも可能です。"}
  ]'::jsonb,
  '民泊運営を始める'
FROM public.industry_templates
WHERE template_key = 'vacation-rental';