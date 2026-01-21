-- Insert 22 new industry templates
INSERT INTO industry_templates (template_key, name, name_en, description, category, icon, is_active, is_featured, sort_order)
VALUES 
  -- 小売・流通 (+3)
  ('pharmacy', '薬局・ドラッグストア', 'Pharmacy', '処方箋管理から在庫・顧客管理まで一元化', 'retail', 'Pill', true, false, 104),
  ('jewelry', 'ジュエリー・時計販売', 'Jewelry Store', '高単価商品の顧客管理と修理追跡', 'retail', 'Gem', true, false, 105),
  ('furniture', '家具・インテリア', 'Furniture Store', '在庫管理から配送・設置まで一括管理', 'retail', 'Sofa', true, false, 106),
  
  -- 飲食・サービス (+4)
  ('cafe', 'カフェ・喫茶店', 'Cafe', '売上・在庫・シフトを一元管理', 'service', 'Coffee', true, false, 204),
  ('bakery', 'パン屋・ケーキ屋', 'Bakery', '製造計画から販売管理まで効率化', 'service', 'Croissant', true, false, 205),
  ('spa', 'エステ・スパ', 'Spa & Esthetics', '予約・顧客管理・売上分析をAIで最適化', 'service', 'Sparkles', true, true, 206),
  ('wedding', 'ウェディング・イベント', 'Wedding & Events', 'プロジェクト管理から契約・請求まで', 'service', 'HeartHandshake', true, false, 207),
  
  -- 専門サービス (+3)
  ('architect', '建築設計事務所', 'Architect Office', 'プロジェクト管理・契約・請求を効率化', 'professional', 'Ruler', true, false, 304),
  ('translation', '翻訳・通訳', 'Translation Services', '案件管理から納品・請求まで一元化', 'professional', 'Languages', true, false, 305),
  ('hr-agency', '人材紹介・派遣', 'HR Agency', '求職者・企業・案件を統合管理', 'professional', 'Users', true, true, 306),
  
  -- 医療・福祉 (+3)
  ('dental', '歯科医院', 'Dental Clinic', '予約・カルテ・会計を統合管理', 'healthcare', 'Smile', true, true, 404),
  ('pharmacy-clinic', '調剤薬局', 'Dispensing Pharmacy', '調剤記録・在庫・患者管理を効率化', 'healthcare', 'Pill', true, false, 405),
  ('veterinary', '動物病院', 'Veterinary Clinic', 'ペットのカルテ・予約・在庫を一元管理', 'healthcare', 'PawPrint', true, false, 406),
  
  -- 建設・製造 (+2)
  ('electrical', '電気工事', 'Electrical Contractor', '現場管理・見積・請求を効率化', 'construction', 'Zap', true, false, 504),
  ('plumbing', '設備工事（配管・空調）', 'Plumbing & HVAC', '工事管理・在庫・契約を一括管理', 'construction', 'Wrench', true, false, 505),
  
  -- IT・クリエイティブ (+3)
  ('saas', 'SaaS・サブスクビジネス', 'SaaS Business', 'サブスク課金・顧客管理・サポートを統合', 'it', 'Cloud', true, true, 604),
  ('marketing-agency', 'マーケティング代理店', 'Marketing Agency', 'キャンペーン・クライアント・レポート管理', 'it', 'Megaphone', true, false, 605),
  ('photo-studio', '写真スタジオ', 'Photo Studio', '予約・撮影管理・納品を効率化', 'it', 'Camera', true, false, 606),
  
  -- 物流・農業 (+2)
  ('warehouse', '倉庫・3PL', 'Warehouse & 3PL', '入出庫・在庫・配送を統合管理', 'logistics', 'Warehouse', true, false, 704),
  ('food-delivery', 'フードデリバリー', 'Food Delivery', '注文・配送・売上を一元管理', 'logistics', 'Bike', true, false, 705),
  
  -- 教育・非営利 (+2)
  ('npo', 'NPO・社団法人', 'NPO & Association', '会員・寄付・会計を効率管理', 'education', 'HandHeart', true, false, 804),
  ('driving-school', '自動車教習所', 'Driving School', '予約・教習管理・生徒追跡を統合', 'education', 'CarFront', true, false, 805);

-- Insert menu configs for new templates
INSERT INTO template_menu_config (template_id, menu_groups, hidden_features, emphasized_features)
SELECT id, menu_groups::jsonb, hidden_features::text[], emphasized_features::text[]
FROM (VALUES
  ('pharmacy', '[{"id": "inventory", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['hr', 'projects'], ARRAY['inventory', 'crm']),
  ('jewelry', '[{"id": "crm", "priority": 1}, {"id": "inventory", "priority": 2}, {"id": "sales", "priority": 3}]', ARRAY['projects', 'hr'], ARRAY['crm', 'inventory']),
  ('furniture', '[{"id": "inventory", "priority": 1}, {"id": "sales", "priority": 2}, {"id": "crm", "priority": 3}]', ARRAY['hr', 'projects'], ARRAY['inventory', 'sales']),
  ('cafe', '[{"id": "sales", "priority": 1}, {"id": "inventory", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['crm', 'hr'], ARRAY['sales', 'inventory']),
  ('bakery', '[{"id": "inventory", "priority": 1}, {"id": "sales", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['crm', 'hr'], ARRAY['inventory', 'sales']),
  ('spa', '[{"id": "crm", "priority": 1}, {"id": "members", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['inventory', 'hr'], ARRAY['crm', 'members']),
  ('wedding', '[{"id": "projects", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "contracts", "priority": 3}]', ARRAY['inventory', 'hr'], ARRAY['projects', 'crm']),
  ('architect', '[{"id": "projects", "priority": 1}, {"id": "contracts", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['inventory', 'crm'], ARRAY['projects', 'contracts']),
  ('translation', '[{"id": "projects", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "documents", "priority": 3}]', ARRAY['inventory', 'hr'], ARRAY['projects', 'crm']),
  ('hr-agency', '[{"id": "recruiting", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "contracts", "priority": 3}]', ARRAY['inventory', 'projects'], ARRAY['recruiting', 'crm']),
  ('dental', '[{"id": "emr", "priority": 1}, {"id": "members", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['inventory', 'projects'], ARRAY['emr', 'members']),
  ('pharmacy-clinic', '[{"id": "inventory", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['hr', 'projects'], ARRAY['inventory', 'crm']),
  ('veterinary', '[{"id": "emr", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "inventory", "priority": 3}]', ARRAY['hr', 'projects'], ARRAY['emr', 'crm']),
  ('electrical', '[{"id": "projects", "priority": 1}, {"id": "documents", "priority": 2}, {"id": "contracts", "priority": 3}]', ARRAY['crm', 'hr'], ARRAY['projects', 'documents']),
  ('plumbing', '[{"id": "projects", "priority": 1}, {"id": "inventory", "priority": 2}, {"id": "contracts", "priority": 3}]', ARRAY['crm', 'hr'], ARRAY['projects', 'inventory']),
  ('saas', '[{"id": "billing", "priority": 1}, {"id": "support", "priority": 2}, {"id": "crm", "priority": 3}]', ARRAY['inventory', 'projects'], ARRAY['billing', 'support']),
  ('marketing-agency', '[{"id": "projects", "priority": 1}, {"id": "crm", "priority": 2}, {"id": "documents", "priority": 3}]', ARRAY['inventory', 'hr'], ARRAY['projects', 'crm']),
  ('photo-studio', '[{"id": "crm", "priority": 1}, {"id": "projects", "priority": 2}, {"id": "documents", "priority": 3}]', ARRAY['inventory', 'hr'], ARRAY['crm', 'projects']),
  ('warehouse', '[{"id": "inventory", "priority": 1}, {"id": "sales", "priority": 2}, {"id": "documents", "priority": 3}]', ARRAY['crm', 'hr'], ARRAY['inventory', 'sales']),
  ('food-delivery', '[{"id": "sales", "priority": 1}, {"id": "inventory", "priority": 2}, {"id": "crm", "priority": 3}]', ARRAY['hr', 'projects'], ARRAY['sales', 'inventory']),
  ('npo', '[{"id": "members", "priority": 1}, {"id": "accounting", "priority": 2}, {"id": "crm", "priority": 3}]', ARRAY['inventory', 'projects'], ARRAY['members', 'accounting']),
  ('driving-school', '[{"id": "members", "priority": 1}, {"id": "lms", "priority": 2}, {"id": "accounting", "priority": 3}]', ARRAY['inventory', 'crm'], ARRAY['members', 'lms'])
) AS t(template_key, menu_groups, hidden_features, emphasized_features)
JOIN industry_templates it ON it.template_key = t.template_key;

-- Insert landing content for new templates
INSERT INTO template_landing_content (template_id, hero_title, hero_subtitle, cta_text, pain_points, solutions, features)
SELECT id, hero_title, hero_subtitle, cta_text, pain_points::jsonb, solutions::jsonb, features::jsonb
FROM (VALUES
  ('pharmacy', '薬局経営をAIで効率化', '処方箋・在庫・顧客管理を一元化', '無料で始める',
   '[{"icon": "AlertCircle", "title": "在庫切れの不安", "description": "必要な薬が欠品してしまう"}, {"icon": "Clock", "title": "棚卸しに時間がかかる", "description": "手作業での在庫確認が大変"}]',
   '[{"icon": "CheckCircle", "title": "自動発注提案", "description": "AIが在庫状況から発注を提案"}, {"icon": "Zap", "title": "リアルタイム在庫", "description": "常に正確な在庫状況を把握"}]',
   '[{"icon": "Package", "title": "在庫管理", "description": "薬品の在庫をリアルタイム管理"}, {"icon": "Users", "title": "顧客管理", "description": "患者情報と調剤履歴を一元管理"}]'),
  ('jewelry', 'ジュエリー販売をスマートに', '顧客・在庫・修理を統合管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "顧客情報が散在", "description": "購入履歴や好みを把握しづらい"}, {"icon": "Clock", "title": "修理追跡が大変", "description": "預かり品の状況管理に手間"}]',
   '[{"icon": "CheckCircle", "title": "顧客360度ビュー", "description": "購入・修理履歴を一覧表示"}, {"icon": "Zap", "title": "修理ステータス管理", "description": "預かりから納品まで追跡"}]',
   '[{"icon": "Users", "title": "VIP顧客管理", "description": "優良顧客を特定し関係強化"}, {"icon": "Package", "title": "在庫管理", "description": "高額商品の在庫を正確に把握"}]'),
  ('furniture', '家具販売を効率化', '在庫・配送・顧客管理を一括', '無料で始める',
   '[{"icon": "AlertCircle", "title": "配送調整が複雑", "description": "設置日程の調整に手間がかかる"}, {"icon": "Clock", "title": "在庫確認に時間", "description": "店舗・倉庫の在庫が不明確"}]',
   '[{"icon": "CheckCircle", "title": "配送スケジュール管理", "description": "設置日程を効率的に調整"}, {"icon": "Zap", "title": "統合在庫管理", "description": "全拠点の在庫を一元把握"}]',
   '[{"icon": "Package", "title": "在庫管理", "description": "店舗・倉庫の在庫を統合管理"}, {"icon": "Truck", "title": "配送管理", "description": "配送・設置のスケジュール管理"}]'),
  ('cafe', 'カフェ経営をシンプルに', '売上・在庫・シフトを一元管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "売上把握が大変", "description": "日次の売上分析に時間がかかる"}, {"icon": "Clock", "title": "在庫ロスが多い", "description": "食材の廃棄が発生しがち"}]',
   '[{"icon": "CheckCircle", "title": "リアルタイム売上", "description": "売上をリアルタイムで把握"}, {"icon": "Zap", "title": "在庫最適化", "description": "AIが需要予測で在庫を最適化"}]',
   '[{"icon": "TrendingUp", "title": "売上分析", "description": "時間帯・曜日別の売上分析"}, {"icon": "Package", "title": "在庫管理", "description": "食材・消耗品の在庫管理"}]'),
  ('bakery', 'パン屋経営を効率化', '製造計画から販売管理まで', '無料で始める',
   '[{"icon": "AlertCircle", "title": "製造量の予測が難しい", "description": "売れ残りや品切れが発生"}, {"icon": "Clock", "title": "原価管理が複雑", "description": "材料費の把握に手間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "需要予測", "description": "AIが販売予測で製造量を提案"}, {"icon": "Zap", "title": "原価自動計算", "description": "レシピから原価を自動算出"}]',
   '[{"icon": "Package", "title": "在庫管理", "description": "材料の在庫と発注管理"}, {"icon": "TrendingUp", "title": "売上分析", "description": "商品別・時間帯別の売上分析"}]'),
  ('spa', 'エステサロンをDX化', '予約・顧客・売上を統合管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "予約管理が煩雑", "description": "ダブルブッキングや空き時間が発生"}, {"icon": "Clock", "title": "顧客情報が散在", "description": "施術履歴の確認に時間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "スマート予約", "description": "オンライン予約で効率化"}, {"icon": "Zap", "title": "カルテ管理", "description": "施術履歴を一元管理"}]',
   '[{"icon": "Calendar", "title": "予約管理", "description": "オンライン予約とスケジュール管理"}, {"icon": "Users", "title": "顧客管理", "description": "施術履歴・好みを記録"}]'),
  ('wedding', 'ウェディング事業を効率化', 'プロジェクト・契約・請求を統合', '無料で始める',
   '[{"icon": "AlertCircle", "title": "タスク管理が複雑", "description": "複数案件の進捗把握が大変"}, {"icon": "Clock", "title": "契約書類が煩雑", "description": "契約・見積の作成に時間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "案件ダッシュボード", "description": "全案件の進捗を一覧表示"}, {"icon": "Zap", "title": "書類自動生成", "description": "契約書・見積書を自動作成"}]',
   '[{"icon": "FolderKanban", "title": "プロジェクト管理", "description": "案件ごとのタスク・スケジュール管理"}, {"icon": "FileText", "title": "契約管理", "description": "電子契約と書類管理"}]'),
  ('architect', '設計事務所をスマートに', 'プロジェクト・契約・請求を効率化', '無料で始める',
   '[{"icon": "AlertCircle", "title": "プロジェクト管理が複雑", "description": "複数案件の進捗把握が困難"}, {"icon": "Clock", "title": "見積作成に時間", "description": "詳細な見積書の作成が大変"}]',
   '[{"icon": "CheckCircle", "title": "統合プロジェクト管理", "description": "全案件を一元管理"}, {"icon": "Zap", "title": "見積テンプレート", "description": "過去の見積を活用して効率化"}]',
   '[{"icon": "FolderKanban", "title": "プロジェクト管理", "description": "設計案件の進捗・タスク管理"}, {"icon": "FileText", "title": "契約管理", "description": "設計契約の作成・管理"}]'),
  ('translation', '翻訳業務を効率化', '案件・納品・請求を一元管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "案件管理が煩雑", "description": "複数案件の納期管理が大変"}, {"icon": "Clock", "title": "請求業務に時間", "description": "案件ごとの請求書作成が手間"}]',
   '[{"icon": "CheckCircle", "title": "案件ダッシュボード", "description": "全案件の状況を一覧表示"}, {"icon": "Zap", "title": "請求自動化", "description": "案件完了時に請求書を自動生成"}]',
   '[{"icon": "FolderKanban", "title": "案件管理", "description": "翻訳案件の進捗・納期管理"}, {"icon": "Users", "title": "クライアント管理", "description": "取引先情報と履歴を一元管理"}]'),
  ('hr-agency', '人材ビジネスを加速', '求職者・企業・案件を統合管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "マッチングが非効率", "description": "求職者と求人の照合に時間"}, {"icon": "Clock", "title": "進捗管理が煩雑", "description": "複数案件の状況把握が困難"}]',
   '[{"icon": "CheckCircle", "title": "AIマッチング", "description": "最適な求職者を自動提案"}, {"icon": "Zap", "title": "パイプライン管理", "description": "選考状況を可視化"}]',
   '[{"icon": "Users", "title": "求職者管理", "description": "スキル・経歴・希望条件を管理"}, {"icon": "Building2", "title": "企業管理", "description": "求人企業と案件を一元管理"}]'),
  ('dental', '歯科医院をDX化', '予約・カルテ・会計を統合', '無料で始める',
   '[{"icon": "AlertCircle", "title": "予約管理が煩雑", "description": "電話予約の対応に時間がかかる"}, {"icon": "Clock", "title": "カルテ記入が大変", "description": "診療後の記録に時間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "オンライン予約", "description": "患者がWebから予約可能"}, {"icon": "Zap", "title": "音声入力カルテ", "description": "診療中に音声でカルテ入力"}]',
   '[{"icon": "FileText", "title": "電子カルテ", "description": "診療記録をデジタル管理"}, {"icon": "Calendar", "title": "予約管理", "description": "ユニット別の予約スケジュール"}]'),
  ('pharmacy-clinic', '調剤薬局を効率化', '調剤・在庫・患者管理を統合', '無料で始める',
   '[{"icon": "AlertCircle", "title": "在庫管理が複雑", "description": "多品目の薬品管理が大変"}, {"icon": "Clock", "title": "患者対応に時間", "description": "服薬指導の記録に手間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "自動在庫管理", "description": "使用量から在庫を自動更新"}, {"icon": "Zap", "title": "服薬記録", "description": "指導内容を効率的に記録"}]',
   '[{"icon": "Package", "title": "在庫管理", "description": "薬品の在庫・発注管理"}, {"icon": "Users", "title": "患者管理", "description": "処方履歴・服薬指導を記録"}]'),
  ('veterinary', '動物病院をスマートに', 'カルテ・予約・在庫を一元化', '無料で始める',
   '[{"icon": "AlertCircle", "title": "カルテ管理が煩雑", "description": "紙カルテの検索に時間がかかる"}, {"icon": "Clock", "title": "予約調整が大変", "description": "電話対応に時間を取られる"}]',
   '[{"icon": "CheckCircle", "title": "電子カルテ", "description": "診療記録をデジタル化"}, {"icon": "Zap", "title": "オンライン予約", "description": "飼い主がWebから予約可能"}]',
   '[{"icon": "FileText", "title": "電子カルテ", "description": "ペットの診療記録を管理"}, {"icon": "Users", "title": "飼い主管理", "description": "連絡先・ペット情報を一元管理"}]'),
  ('electrical', '電気工事業を効率化', '現場・見積・請求を統合管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "現場管理が煩雑", "description": "複数現場の進捗把握が困難"}, {"icon": "Clock", "title": "見積作成に時間", "description": "材料費・工賃の積算が大変"}]',
   '[{"icon": "CheckCircle", "title": "現場ダッシュボード", "description": "全現場の状況を一覧表示"}, {"icon": "Zap", "title": "見積テンプレート", "description": "過去の見積を活用して効率化"}]',
   '[{"icon": "FolderKanban", "title": "現場管理", "description": "工事現場の進捗・スケジュール管理"}, {"icon": "FileText", "title": "見積管理", "description": "見積書の作成・履歴管理"}]'),
  ('plumbing', '設備工事を効率化', '工事・在庫・契約を一括管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "部材管理が複雑", "description": "多品目の在庫把握が困難"}, {"icon": "Clock", "title": "工程管理が大変", "description": "複数案件の調整に時間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "在庫自動管理", "description": "使用部材から在庫を自動更新"}, {"icon": "Zap", "title": "工程表自動生成", "description": "案件から工程表を自動作成"}]',
   '[{"icon": "FolderKanban", "title": "工事管理", "description": "工事案件の進捗・スケジュール管理"}, {"icon": "Package", "title": "部材管理", "description": "配管・部材の在庫管理"}]'),
  ('saas', 'SaaSビジネスを加速', 'サブスク課金・顧客・サポートを統合', '無料で始める',
   '[{"icon": "AlertCircle", "title": "解約が把握しづらい", "description": "解約リスクの早期発見が困難"}, {"icon": "Clock", "title": "請求処理が煩雑", "description": "プラン変更時の按分計算が複雑"}]',
   '[{"icon": "CheckCircle", "title": "解約予兆検知", "description": "AIが解約リスクを事前に検知"}, {"icon": "Zap", "title": "自動課金", "description": "サブスク請求を自動処理"}]',
   '[{"icon": "CreditCard", "title": "課金管理", "description": "サブスクリプション課金を自動化"}, {"icon": "Headphones", "title": "サポート管理", "description": "チケット管理とナレッジベース"}]'),
  ('marketing-agency', 'マーケ代理店を効率化', 'キャンペーン・クライアント管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "案件管理が煩雑", "description": "複数クライアントの進捗把握が困難"}, {"icon": "Clock", "title": "レポート作成に時間", "description": "成果報告書の作成が大変"}]',
   '[{"icon": "CheckCircle", "title": "案件ダッシュボード", "description": "全案件の状況を一覧表示"}, {"icon": "Zap", "title": "レポート自動生成", "description": "成果データから報告書を自動作成"}]',
   '[{"icon": "FolderKanban", "title": "案件管理", "description": "キャンペーンの進捗・タスク管理"}, {"icon": "Users", "title": "クライアント管理", "description": "取引先情報と案件履歴"}]'),
  ('photo-studio', 'フォトスタジオを効率化', '予約・撮影・納品を統合管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "予約調整が煩雑", "description": "スタジオ・機材の空き確認が大変"}, {"icon": "Clock", "title": "納品管理が複雑", "description": "写真の選定・納品に時間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "オンライン予約", "description": "クライアントがWebから予約"}, {"icon": "Zap", "title": "納品ポータル", "description": "写真選定・ダウンロードを効率化"}]',
   '[{"icon": "Calendar", "title": "予約管理", "description": "スタジオ・機材の予約管理"}, {"icon": "Users", "title": "顧客管理", "description": "撮影履歴・好みを記録"}]'),
  ('warehouse', '倉庫業務を最適化', '入出庫・在庫・配送を統合', '無料で始める',
   '[{"icon": "AlertCircle", "title": "在庫差異が発生", "description": "実在庫とシステムの差異が問題"}, {"icon": "Clock", "title": "ピッキングに時間", "description": "出荷作業の効率が悪い"}]',
   '[{"icon": "CheckCircle", "title": "バーコード管理", "description": "入出庫をスキャンで正確に記録"}, {"icon": "Zap", "title": "ピッキング最適化", "description": "効率的なピッキングルートを提案"}]',
   '[{"icon": "Package", "title": "在庫管理", "description": "ロケーション別の在庫管理"}, {"icon": "Truck", "title": "配送管理", "description": "出荷・配送のスケジュール管理"}]'),
  ('food-delivery', 'デリバリーを効率化', '注文・配送・売上を一元管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "配送効率が悪い", "description": "ルート最適化ができていない"}, {"icon": "Clock", "title": "注文管理が煩雑", "description": "複数チャネルの注文を手動で処理"}]',
   '[{"icon": "CheckCircle", "title": "ルート最適化", "description": "AIが最適な配送ルートを提案"}, {"icon": "Zap", "title": "注文統合", "description": "全チャネルの注文を一元管理"}]',
   '[{"icon": "ShoppingCart", "title": "注文管理", "description": "注文受付から配送完了まで追跡"}, {"icon": "TrendingUp", "title": "売上分析", "description": "エリア・時間帯別の売上分析"}]'),
  ('npo', 'NPO運営を効率化', '会員・寄付・会計を統合管理', '無料で始める',
   '[{"icon": "AlertCircle", "title": "会員管理が煩雑", "description": "会費の徴収・管理に手間がかかる"}, {"icon": "Clock", "title": "経理業務が大変", "description": "決算報告書の作成に時間がかかる"}]',
   '[{"icon": "CheckCircle", "title": "会員ポータル", "description": "会員情報・会費をオンライン管理"}, {"icon": "Zap", "title": "決算書自動生成", "description": "NPO会計に対応した決算書を自動作成"}]',
   '[{"icon": "Users", "title": "会員管理", "description": "会員情報・会費・活動履歴を管理"}, {"icon": "Calculator", "title": "NPO会計", "description": "NPO法人向けの会計・決算機能"}]'),
  ('driving-school', '教習所をDX化', '予約・教習・生徒管理を統合', '無料で始める',
   '[{"icon": "AlertCircle", "title": "予約調整が煩雑", "description": "教官・車両の空き確認が大変"}, {"icon": "Clock", "title": "進捗把握が困難", "description": "生徒ごとの教習進捗が不明確"}]',
   '[{"icon": "CheckCircle", "title": "オンライン予約", "description": "生徒がWebから教習を予約"}, {"icon": "Zap", "title": "進捗ダッシュボード", "description": "全生徒の教習進捗を一覧表示"}]',
   '[{"icon": "Users", "title": "生徒管理", "description": "入校から卒業までの進捗管理"}, {"icon": "BookOpen", "title": "教習管理", "description": "教習スケジュール・記録管理"}]')
) AS t(template_key, hero_title, hero_subtitle, cta_text, pain_points, solutions, features)
JOIN industry_templates it ON it.template_key = t.template_key;